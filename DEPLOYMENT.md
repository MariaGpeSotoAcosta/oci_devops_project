# OCI Kubernetes Deployment Guide

> **Project:** MyTodoList — Spring Boot + React full-stack app deployed on Oracle Cloud Infrastructure (OKE)
> **Repository:** https://github.com/MariaGpeSotoAcosta/oci_devops_project/tree/develop
> **Last successful deployment:** April 24 2026 — image `0.3`, External IP `163.192.142.255`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites](#2-prerequisites)
3. [OCI Setup — Groups and Policies](#3-oci-setup--groups-and-policies)
4. [Cloud Shell Setup](#4-cloud-shell-setup)
5. [Cloning the Repository](#5-cloning-the-repository)
6. [Create `application.properties`](#6-create-applicationproperties) ⚠️ Critical step
7. [Oracle DB Wallet Setup](#7-oracle-db-wallet-setup)
8. [Kubernetes Cluster — Connect to OKE](#8-kubernetes-cluster--connect-to-oke)
9. [Fix Spring Security for Frontend Access](#9-fix-spring-security-for-frontend-access) ⚠️ Required fix
10. [Build the Application](#10-build-the-application)
11. [Docker Build and Push to OCIR](#11-docker-build-and-push-to-ocir)
12. [Create Kubernetes Secrets](#12-create-kubernetes-secrets)
13. [Kubernetes Deployment](#13-kubernetes-deployment)
14. [Verification Steps](#14-verification-steps)
15. [How to Access the Application](#15-how-to-access-the-application)
16. [Undeploy and Redeploy](#16-undeploy-and-redeploy)
17. [Troubleshooting](#17-troubleshooting)
18. [Issues We Fixed — Session Log](#18-issues-we-fixed--session-log)
19. [Quick Checklist](#19-quick-checklist)
20. [Notes for Improvement](#20-notes-for-improvement)

---

## 1. Project Overview

This is a full-stack **Todo List** application with:

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Backend       | Java 17 + Spring Boot 3.x (Maven)   |
| Frontend      | React 18 + TypeScript + Vite        |
| Database      | Oracle Autonomous Database (wallet) |
| Bot           | Telegram Bot integration            |
| Container     | Docker (openjdk:22-jdk)             |
| Orchestration | Kubernetes on OKE (OCI)             |
| Registry      | OCIR (OCI Container Registry)       |

The frontend is **embedded inside the Spring Boot JAR** — there is only one container to deploy.

**Architecture:**
```
Internet → OCI Load Balancer (port 80)
              ↓
         OKE Cluster (2 pods, port 8080)
              ↓
         Oracle Autonomous Database (wallet auth via /mtdrworkshop/creds)
```

**Known values for this project:**

| Variable | Value |
|----------|-------|
| OCI Region | `mx-queretaro-1` |
| Tenancy Namespace | `ax2ruuecmcce` |
| OCIR Registry | `mx-queretaro-1.ocir.io/ax2ruuecmcce` |
| DB Service Name | `justtodo_high` |
| DB User | `CHATBOT_USER` |
| Cluster OCID | `ocid1.cluster.oc1.mx-queretaro-1.aaaaaaaatz5me5xo2nnsqnkzwmd7rotx5j5vdkdis7oe3aqjhc32vcuc5tba` |
| App External IP | `163.192.142.255` |
| Working Image | `mx-queretaro-1.ocir.io/ax2ruuecmcce/todolistapp-springboot:0.3` |

---

## 2. Prerequisites

### Accounts and Access
- [ ] Oracle Cloud account with admin or sufficient permissions
- [ ] OKE cluster already created and has at least 1 node pool with 2 nodes running
- [ ] Oracle Autonomous Database provisioned with wallet downloaded
- [ ] Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### Tools (all pre-installed in OCI Cloud Shell)
- `kubectl`, `docker`, `mvn`, `node/npm`, `oci`, `python3`

> **Always use OCI Cloud Shell (x86).** No local installation needed.

---

## 3. OCI Setup — Groups and Policies

### 3.1 Verify Your OKE Node Pool Has Nodes

> **Learned from experience:** A cluster can exist with zero nodes — `kubectl get nodes` returns nothing.
> This will cause all pods to be unschedulable.

In OCI Console:
1. **Developer Services → Kubernetes Clusters (OKE)** → click your cluster
2. Click the **Node Pools** tab
3. If the node pool shows **0 nodes** → click it → **Edit** → set nodes to `2` → Save
4. If there is **no node pool** → click **Add Node Pool**:
   - Shape: `VM.Standard.E4.Flex`
   - OCPUs: `1`, Memory: `16 GB`
   - Nodes: `2`
   - Subnet: select the worker subnet
5. Wait 5–10 minutes, then verify:

```bash
kubectl get nodes
# Expected: 2 nodes with STATUS = Ready
```

### 3.2 Required IAM Policies

Go to **Identity & Security → Policies** → create in root compartment:

```
Allow group devops-group to manage repos in tenancy
Allow group devops-group to use clusters in tenancy
Allow group devops-group to manage objects in tenancy
Allow group devops-group to read secret-family in tenancy
Allow group devops-group to use autonomous-database-family in tenancy
```

### 3.3 Create an Auth Token for Docker Login

1. OCI Console → top-right corner → click your username
2. **Auth Tokens → Generate Token** → name it `ocir-token`
3. **Copy and save it immediately** — it is never shown again

---

## 4. Cloud Shell Setup

### 4.1 Open Cloud Shell

Click the **Cloud Shell** icon (terminal icon, top right of OCI Console).
Confirm it says **"Cloud Shell (x86)"**.

### 4.2 Set Environment Variables

Paste this block into Cloud Shell and fill in the sensitive values:

```bash
# Non-sensitive — already known for this project
export OCI_REGION="mx-queretaro-1"
export TENANCY_NAMESPACE="ax2ruuecmcce"
export DOCKER_REGISTRY="${OCI_REGION}.ocir.io/${TENANCY_NAMESPACE}"
export TODO_DB_NAME="justtodo_high"
export DB_USER="CHATBOT_USER"
export UI_USERNAME="admin"

# Sensitive — fill these in yourself
export DB_PASSWORD="YOUR_DB_PASSWORD"           # spring.datasource.password
export UI_PASSWORD="CHOOSE_A_PASSWORD"          # login password for the web UI (you invent this)
export TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN"      # from @BotFather on Telegram
export OCI_USER_EMAIL="YOUR_OCI_EMAIL"          # your Oracle Cloud login email
export OCI_AUTH_TOKEN="YOUR_AUTH_TOKEN"         # the token from step 3.3
```

**Verify:**
```bash
echo "Registry:  $DOCKER_REGISTRY"
echo "DB Name:   $TODO_DB_NAME"
echo "UI User:   $UI_USERNAME"
```

### 4.3 Log In to OCIR

```bash
docker login "${OCI_REGION}.ocir.io" \
  --username "${TENANCY_NAMESPACE}/${OCI_USER_EMAIL}" \
  --password "${OCI_AUTH_TOKEN}"
# Expected: Login Succeeded
```

---

## 5. Cloning the Repository

```bash
cd ~
git clone https://github.com/MariaGpeSotoAcosta/oci_devops_project.git
cd oci_devops_project
git checkout develop
```

---

## 6. Create `application.properties`

> ⚠️ **This is the most critical step and the one most likely to be missed.**
>
> `application.properties` is in `.gitignore` — it is NOT cloned from GitHub.
> If you skip this step, the JAR is built without it and Spring Boot cannot inject
> `jwt.secret`, `jwt.expiration`, or database properties. The result is a
> `CrashLoopBackOff` with `Injection of autowired dependencies failed` on startup.

Create the file now in Cloud Shell:

```bash
cat > ~/oci_devops_project/MtdrSpring/backend/src/main/resources/application.properties << 'EOF'
server.port=8080

spring.jpa.database-platform=org.hibernate.community.dialect.Oracle12cDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

spring.datasource.type=oracle.ucp.jdbc.PoolDataSource
spring.datasource.oracleucp.connection-factory-class-name=oracle.jdbc.pool.OracleDataSource
spring.datasource.oracleucp.sql-for-validate-connection=select * from dual
spring.datasource.oracleucp.connection-pool-name=connectionPoolName1
spring.datasource.oracleucp.initial-pool-size=5
spring.datasource.oracleucp.min-pool-size=5
spring.datasource.oracleucp.max-pool-size=20
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

# These are injected at runtime from Kubernetes env vars and secrets
spring.datasource.username=${db_user}
spring.datasource.password=${dbpassword}
spring.datasource.url=${db_url}

oracle.net.tns_admin=/mtdrworkshop/creds

jwt.secret=c3ByaW5nYm9vdC1qd3Qtc2VjcmV0LWtleS0yMDI2LXByb2plY3Qtb2NpLWRldm9wcw==
jwt.expiration=86400000

telegram.bot.token=${TELEGRAM_BOT_TOKEN}
telegram.bot.name=Todolist2026oraclebot

deepseek.api.key=sk-test
deepseek.api.url=https://api.deepseek.com/v1/chat/completions
EOF
```

Verify it was created correctly:
```bash
grep -E "jwt.secret|datasource.url|telegram" \
  ~/oci_devops_project/MtdrSpring/backend/src/main/resources/application.properties
```

Expected output:
```
spring.datasource.url=${db_url}
jwt.secret=c3ByaW5nYm9vdC1qd3Qtc2VjcmV0LWtleS0yMDI2LXByb2plY3Qtb2NpLWRldm9wcw==
telegram.bot.token=${TELEGRAM_BOT_TOKEN}
```

---

## 7. Oracle DB Wallet Setup

### 7.1 Upload and Extract Wallet

1. In Cloud Shell → click the **gear icon** (top-right) → **Upload**
2. Select your `Wallet_justtodo.zip` file
3. Extract it:

```bash
unzip ~/Wallet_justtodo.zip \
  -d ~/oci_devops_project/MtdrSpring/backend/wallet/

ls ~/oci_devops_project/MtdrSpring/backend/wallet/
# Expected: cwallet.sso  ewallet.p12  keystore.jks  ojdbc.properties
#           sqlnet.ora   tnsnames.ora  truststore.jks
```

### 7.2 Fix the Wallet Path in `sqlnet.ora`

> The wallet is mounted at `/mtdrworkshop/creds` inside the pod.
> The default `sqlnet.ora` likely points to a local path — this causes ORA-12154/ORA-12263.

```bash
# Fix the path
sed -i 's|DIRECTORY=.*|DIRECTORY="/mtdrworkshop/creds")|g' \
  ~/oci_devops_project/MtdrSpring/backend/wallet/sqlnet.ora

# Confirm
grep DIRECTORY ~/oci_devops_project/MtdrSpring/backend/wallet/sqlnet.ora
# Expected: DIRECTORY="/mtdrworkshop/creds"
```

### 7.3 Confirm Your DB Service Name

```bash
grep -E "^\w+" \
  ~/oci_devops_project/MtdrSpring/backend/wallet/tnsnames.ora | grep -o '^\w*'
```

For this project the correct service name is **`justtodo_high`**.
The JDBC URL format used is:
```
jdbc:oracle:thin:@justtodo_high?TNS_ADMIN=/mtdrworkshop/creds
```

> **Important:** The Kubernetes deployment template adds `_tp` to the DB name automatically
> (e.g., `%TODO_PDB_NAME%_tp`). Because of this, we set `db_url` directly via
> `kubectl set env` after deployment instead of relying on the template substitution.

---

## 8. Kubernetes Cluster — Connect to OKE

### 8.1 Configure kubectl

Run the exact command shown in OCI Console → OKE → your cluster → **Access Cluster**:

```bash
oci ce cluster create-kubeconfig \
  --cluster-id ocid1.cluster.oc1.mx-queretaro-1.aaaaaaaatz5me5xo2nnsqnkzwmd7rotx5j5vdkdis7oe3aqjhc32vcuc5tba \
  --file $HOME/.kube/config \
  --region mx-queretaro-1 \
  --token-version 2.0.0 \
  --kube-endpoint PUBLIC_ENDPOINT
```

### 8.2 Verify

```bash
kubectl get nodes
# Expected: 2 nodes with STATUS = Ready
```

If you see `No resources found` — your node pool has 0 nodes. See [Section 3.1](#31-verify-your-oke-node-pool-has-nodes).

---

## 9. Fix Spring Security for Frontend Access

> ⚠️ **This fix is required.** Without it, opening `http://<IP>/` returns HTTP 403 immediately
> because Spring Security blocks all paths including the React `index.html`.
>
> The fix allows static frontend files to be served publicly while keeping all API
> endpoints protected by JWT.

Edit the security configuration directly in Cloud Shell:

```bash
cd ~/oci_devops_project/MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/security

python3 -c "
content = open('WebSecurityConfiguration.java').read()
old = '                // Auth endpoints are public\n                .requestMatchers(\"/api/auth/**\").permitAll()\n                // All other endpoints require a valid JWT'
new = '                // Auth endpoints are public\n                .requestMatchers(\"/api/auth/**\").permitAll()\n                // Static frontend resources\n                .requestMatchers(\"/\", \"/index.html\", \"/assets/**\", \"/*.js\", \"/*.css\", \"/*.ico\", \"/*.png\", \"/*.svg\", \"/static/**\").permitAll()\n                // All other endpoints require a valid JWT'
open('WebSecurityConfiguration.java', 'w').write(content.replace(old, new))
print('Done')
"
```

Verify the change:
```bash
grep -A8 "Auth endpoints are public" WebSecurityConfiguration.java
```

Expected output:
```java
                // Auth endpoints are public
                .requestMatchers("/api/auth/**").permitAll()
                // Static frontend resources
                .requestMatchers("/", "/index.html", "/assets/**", "/*.js", "/*.css", "/*.ico", "/*.png", "/*.svg", "/static/**").permitAll()
                // All other endpoints require a valid JWT
                .anyRequest().authenticated()
```

---

## 10. Build the Application

### 10.1 Build the React Frontend

```bash
cd ~/oci_devops_project/MtdrSpring/backend/src/main/frontend
npm install
npm run build
```

### 10.2 Build the Spring Boot JAR

```bash
cd ~/oci_devops_project/MtdrSpring/backend
mvn clean package -DskipTests
```

### 10.3 Verify `application.properties` Is Inside the JAR

```bash
unzip -p target/MyTodoList-0.0.1-SNAPSHOT.jar \
  BOOT-INF/classes/application.properties | grep jwt
# Expected: jwt.secret=c3ByaW5n...
```

If this returns nothing → you skipped Step 6. Go back and create `application.properties` first, then rebuild.

---

## 11. Docker Build and Push to OCIR

### 11.1 Create the OCIR Repository (first time only)

OCI Console → **Developer Services → Container Registry → Create Repository**
- Name: `todolistapp-springboot`
- Visibility: **Public** (avoids pull secret complexity)

### 11.2 Build and Push

```bash
cd ~/oci_devops_project/MtdrSpring/backend

export IMAGE_VERSION="0.1"    # increment this on each redeploy: 0.1, 0.2, 0.3...
export IMAGE="${DOCKER_REGISTRY}/todolistapp-springboot:${IMAGE_VERSION}"

docker build -f Dockerfile -t "${IMAGE}" .
docker push "${IMAGE}"
echo "Pushed: ${IMAGE}"
```

---

## 12. Create Kubernetes Secrets

Run all of these once. They persist in the cluster until you delete them.

```bash
# Database password
kubectl create secret generic dbuser \
  --from-literal=dbpassword="${DB_PASSWORD}"

# Frontend login password
kubectl create secret generic frontendadmin \
  --from-literal=password="${UI_PASSWORD}"

# Oracle wallet (all 7 files from the wallet folder)
kubectl create secret generic db-wallet-secret \
  --from-file=~/oci_devops_project/MtdrSpring/backend/wallet/

# Telegram bot token
kubectl create secret generic telegram-secret \
  --from-literal=bot-token="${TELEGRAM_BOT_TOKEN}"
```

Verify:
```bash
kubectl get secrets
# Should list: dbuser, frontendadmin, db-wallet-secret, telegram-secret
```

---

## 13. Kubernetes Deployment

### 13.1 Generate the Deployment YAML

The template file has placeholders that need replacing:

```bash
cd ~/oci_devops_project

sed \
  -e "s|%DOCKER_REGISTRY%|${DOCKER_REGISTRY}|g" \
  -e "s|%TODO_PDB_NAME%|${TODO_DB_NAME}|g" \
  -e "s|%OCI_REGION%|${OCI_REGION}|g" \
  -e "s|%UI_USERNAME%|${UI_USERNAME}|g" \
  MtdrSpring/backend/src/main/resources/todolistapp-springboot.yaml \
  > todolistapp-final.yaml

# Confirm no placeholders remain
grep "%" todolistapp-final.yaml
# Should return nothing
```

### 13.2 Apply the Deployment

```bash
kubectl apply -f ~/oci_devops_project/todolistapp-final.yaml
```

Expected:
```
service/todolistapp-springboot-service created
service/todolistapp-backend-router created
deployment.apps/todolistapp-springboot-deployment created
```

### 13.3 Set the Correct DB URL and Telegram Token

> The template appends `_tp` to the DB name which produces an invalid alias.
> We override `db_url` directly with the full working JDBC URL.

```bash
kubectl set env deployment/todolistapp-springboot-deployment \
  db_url="jdbc:oracle:thin:@justtodo_high?TNS_ADMIN=/mtdrworkshop/creds" \
  TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN}"

kubectl rollout status deployment/todolistapp-springboot-deployment
```

---

## 14. Verification Steps

### 14.1 Check Pods

```bash
kubectl get pods -w
```

Wait until both show `1/1 Running` with `RESTARTS = 0`:
```
NAME                                                 READY   STATUS    RESTARTS   AGE
todolistapp-springboot-deployment-xxx-aaa            1/1     Running   0          2m
todolistapp-springboot-deployment-xxx-bbb            1/1     Running   0          2m
```

### 14.2 Check Services

```bash
kubectl get services
```

Look for a real IP under `EXTERNAL-IP` (takes 2–5 min to appear):
```
todolistapp-springboot-service   LoadBalancer   10.96.x.x   163.192.142.255   80:xxxxx/TCP
```

### 14.3 Check Logs

```bash
kubectl get pods   # copy a pod name
kubectl logs <pod-name> --follow
```

Look for:
```
Started MyTodoListApplication in X.XXX seconds
```

### 14.4 Test HTTP Response

```bash
IP=$(kubectl get service todolistapp-springboot-service \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

curl -s -o /dev/null -w "%{http_code}" http://$IP/
# Expected: 200
```

---

## 15. How to Access the Application

```
http://163.192.142.255/
```

Log in with:
- **Username:** the value of `UI_USERNAME` (default: `admin`)
- **Password:** the value of `UI_PASSWORD` you chose

| Endpoint             | Description               |
|----------------------|---------------------------|
| `GET /`              | React frontend            |
| `GET /api/todolist`  | Fetch all todo items      |
| `POST /api/todolist` | Create a new todo item    |
| `GET /swagger-ui/`   | Swagger API documentation |

---

## 16. Undeploy and Redeploy

### 16.1 Full Undeploy

```bash
kubectl delete -f ~/oci_devops_project/todolistapp-final.yaml
kubectl delete secret dbuser frontendadmin db-wallet-secret telegram-secret
```

Verify:
```bash
kubectl get pods && kubectl get services && kubectl get secrets
```

### 16.2 Redeploy After Code Changes

```bash
# 1. Re-export env vars (needed every new Cloud Shell session)
export OCI_REGION="mx-queretaro-1"
export TENANCY_NAMESPACE="ax2ruuecmcce"
export DOCKER_REGISTRY="${OCI_REGION}.ocir.io/${TENANCY_NAMESPACE}"
export TODO_DB_NAME="justtodo_high"
export DB_USER="CHATBOT_USER"
export UI_USERNAME="admin"
export DB_PASSWORD="YOUR_DB_PASSWORD"
export UI_PASSWORD="YOUR_UI_PASSWORD"
export TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN"
export OCI_USER_EMAIL="YOUR_EMAIL"
export OCI_AUTH_TOKEN="YOUR_AUTH_TOKEN"

# 2. Recreate application.properties (if Cloud Shell was reset)
#    → repeat Step 6 if the file is missing

# 3. Rebuild frontend
cd ~/oci_devops_project/MtdrSpring/backend/src/main/frontend
npm install && npm run build

# 4. Rebuild JAR
cd ~/oci_devops_project/MtdrSpring/backend
mvn clean package -DskipTests

# 5. Build and push new image (increment version)
export IMAGE_VERSION="0.4"    # use 0.4, 0.5, etc.
export IMAGE="${DOCKER_REGISTRY}/todolistapp-springboot:${IMAGE_VERSION}"
docker build -f Dockerfile -t "${IMAGE}" .
docker push "${IMAGE}"

# 6. Update running deployment
kubectl set image deployment/todolistapp-springboot-deployment \
  todolistapp-springboot="${IMAGE}"

kubectl set env deployment/todolistapp-springboot-deployment \
  db_url="jdbc:oracle:thin:@justtodo_high?TNS_ADMIN=/mtdrworkshop/creds" \
  TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN}"

kubectl rollout status deployment/todolistapp-springboot-deployment
```

### 16.3 Restart Without Code Changes

```bash
kubectl rollout restart deployment/todolistapp-springboot-deployment
kubectl rollout status deployment/todolistapp-springboot-deployment
```

### 16.4 Update a Single Secret

```bash
kubectl delete secret dbuser
kubectl create secret generic dbuser --from-literal=dbpassword="NewPassword"
kubectl rollout restart deployment/todolistapp-springboot-deployment
```

---

## 17. Troubleshooting

### `kubectl get nodes` returns `No resources found`

Your cluster has no worker nodes. See [Section 3.1](#31-verify-your-oke-node-pool-has-nodes).

---

### `CrashLoopBackOff` — `Injection of autowired dependencies failed`

**Cause:** `application.properties` is missing from the JAR (it's gitignored).

**Diagnosis:**
```bash
unzip -p target/MyTodoList-0.0.1-SNAPSHOT.jar \
  BOOT-INF/classes/application.properties | grep jwt
# If this returns nothing → the file is missing
```

**Fix:** Complete [Step 6](#6-create-applicationproperties), then rebuild JAR and image.

---

### `ORA-12154: Could not find alias X in tnsnames.ora`

**Cause:** The JDBC URL references a service name that doesn't exist in your wallet.

**Diagnosis:**
```bash
kubectl get secret db-wallet-secret \
  -o jsonpath='{.data.tnsnames\.ora}' | base64 --decode | grep -o '^\w*'
```

**Fix:** Use the exact alias shown (e.g. `justtodo_high`, not `justtodo_high_tp`):
```bash
kubectl set env deployment/todolistapp-springboot-deployment \
  db_url="jdbc:oracle:thin:@justtodo_high?TNS_ADMIN=/mtdrworkshop/creds"
kubectl rollout restart deployment/todolistapp-springboot-deployment
```

---

### HTTP 403 — Access Denied on `http://<IP>/`

**Cause:** Spring Security blocks all paths including the React frontend's `index.html`.

**Fix:** Complete [Step 9](#9-fix-spring-security-for-frontend-access), then rebuild JAR and image.

---

### `ORA-12263` / Wrong wallet path

**Cause:** `sqlnet.ora` still points to a local Windows path instead of `/mtdrworkshop/creds`.

```bash
cat ~/oci_devops_project/MtdrSpring/backend/wallet/sqlnet.ora
# Fix:
sed -i 's|DIRECTORY=.*|DIRECTORY="/mtdrworkshop/creds")|g' \
  ~/oci_devops_project/MtdrSpring/backend/wallet/sqlnet.ora
# Recreate secret:
kubectl delete secret db-wallet-secret
kubectl create secret generic db-wallet-secret \
  --from-file=~/oci_devops_project/MtdrSpring/backend/wallet/
kubectl rollout restart deployment/todolistapp-springboot-deployment
```

---

### `unable to retrieve container logs` — no logs at all

The container crashed before the JVM could write anything. Use a debug pod:
```bash
kubectl run debug-pod \
  --image=mx-queretaro-1.ocir.io/ax2ruuecmcce/todolistapp-springboot:0.3 \
  --restart=Never --command -- sleep 3600

kubectl exec -it debug-pod -- bash
# Inside the pod:
java -jar /tmp/MyTodoList.jar 2>&1 | head -60
```

---

### `ErrImagePull` / `ImagePullBackOff`

Make the OCIR repository **Public**:
OCI Console → Container Registry → `todolistapp-springboot` → **Actions → Change to Public**

---

### Load Balancer stuck on `<PENDING>`

```bash
kubectl describe service todolistapp-springboot-service
```

Add an ingress rule to your node subnet security list:
OCI Console → **Networking → VCN → Security Lists**
Add: `Source: 0.0.0.0/0 | TCP | Port: 80`

---

### Telegram bot errors in logs (non-fatal)

`TelegramApiErrorResponseException: null` appears in logs but does NOT crash the app.
Caused by an invalid bot token or OKE pods being unable to reach Telegram's API outbound.

Fix the token:
```bash
kubectl delete secret telegram-secret
kubectl create secret generic telegram-secret \
  --from-literal=bot-token="YOUR_CORRECT_TOKEN"
kubectl set env deployment/todolistapp-springboot-deployment \
  TELEGRAM_BOT_TOKEN="YOUR_CORRECT_TOKEN"
```

---

## 18. Issues We Fixed — Session Log

This section documents every real problem we hit and how we solved it, in order.

---

### Issue 1 — No Worker Nodes

**Symptom:** `kubectl get nodes` → `No resources found`

**Root cause:** The OKE cluster existed but had no node pool with running nodes.

**Fix:** Created a node pool via OCI Console (VM.Standard.E4.Flex, 2 nodes).

---

### Issue 2 — `application.properties` Missing from JAR

**Symptom:** Pods in `CrashLoopBackOff`. `kubectl logs` showed:
```
Error creating bean with name 'jwtTokenProvider': Injection of autowired dependencies failed
```
`unable to retrieve container logs for cri-o://...` (crashed before JVM could write anything)

**Root cause:** `application.properties` is in `.gitignore`. After cloning the repo in Cloud Shell,
the file did not exist. Maven built the JAR without it, so `${jwt.secret}` and `${jwt.expiration}`
had no values to inject at startup.

**Confirmed by running a debug pod:**
```bash
jar tf /tmp/MyTodoList.jar | grep -i application
# Only showed: MyTodoListApplication.class — no application.properties
```

**Fix:** Created `application.properties` manually in Cloud Shell (see Step 6), rebuilt JAR and image (`0.2`).

---

### Issue 3 — Wrong DB Service Alias (ORA-12154)

**Symptom:** App started but crashed with:
```
ORA-12154: Could not find alias justtodo_high_tp in /mtdrworkshop/creds/tnsnames.ora
```

**Root cause:** The deployment template `todolistapp-springboot.yaml` has:
```
jdbc:oracle:thin:@%TODO_PDB_NAME%_tp?TNS_ADMIN=...
```
We substituted `TODO_PDB_NAME=justtodo_high`, producing `justtodo_high_tp` which does not exist.
The real alias in `tnsnames.ora` is just `justtodo_high`.

**Fix:**
```bash
kubectl set env deployment/todolistapp-springboot-deployment \
  db_url="jdbc:oracle:thin:@justtodo_high?TNS_ADMIN=/mtdrworkshop/creds"
```

---

### Issue 4 — HTTP 403 on Frontend (Spring Security)

**Symptom:** Both pods `Running`, Load Balancer IP assigned, but browser showed:
```
Access to 163.192.142.255 was denied
You don't have authorization to view this page.
```

**Root cause:** `WebSecurityConfiguration.java` had `.anyRequest().authenticated()` with no
exception for static files. Spring Security blocked `GET /` (the React `index.html`) before
the browser could load anything — no login page appeared, just an immediate 403.

**Fix:** Added static resource paths to the permit list in `WebSecurityConfiguration.java`:
```java
.requestMatchers("/", "/index.html", "/assets/**", "/*.js", "/*.css",
        "/*.ico", "/*.png", "/*.svg", "/static/**").permitAll()
```
Rebuilt JAR and image (`0.3`). App became accessible at `http://163.192.142.255/`.

---

## 19. Quick Checklist

```bash
# 1. Nodes are ready
kubectl get nodes
# → 2 nodes, STATUS = Ready

# 2. application.properties is inside the JAR
unzip -p ~/oci_devops_project/MtdrSpring/backend/target/MyTodoList-0.0.1-SNAPSHOT.jar \
  BOOT-INF/classes/application.properties | grep jwt
# → jwt.secret=c3ByaW5n...

# 3. All secrets exist
kubectl get secrets
# → dbuser, frontendadmin, db-wallet-secret, telegram-secret

# 4. Pods running
kubectl get pods
# → 2 pods, STATUS = Running, RESTARTS = 0

# 5. External IP assigned
kubectl get service todolistapp-springboot-service
# → EXTERNAL-IP = 163.192.142.255

# 6. App responds
curl -s -o /dev/null -w "%{http_code}" http://163.192.142.255/
# → 200

# 7. Logs show successful start
kubectl logs $(kubectl get pods -o name | grep springboot | head -1 | sed 's|pod/||')
# → Started MyTodoListApplication in X.XXX seconds
```

---

## 20. Notes for Improvement

| Area | Current State | Recommended Improvement |
|------|--------------|--------------------------|
| `application.properties` | Created manually each session | Store as K8s ConfigMap or OCI Vault secret |
| **Secrets** | Created manually | Use OCI Vault + External Secrets Operator |
| **Image tag** | Manual increment (`0.1`, `0.2`...) | Use git SHA as tag |
| **DB alias** | Hardcoded via `kubectl set env` | Fix template to use correct alias without `_tp` |
| **Spring Security** | Static patch in Cloud Shell | Commit fix to repo and keep in git |
| **Telegram** | Token in env var, bot errors non-fatal | Verify token and test outbound OKE connectivity |
| **HTTPS** | Plain HTTP | Add OCI Certificate + Ingress with TLS |
| **Health checks** | None | Add `livenessProbe` / `readinessProbe` |
| **CI/CD** | All manual steps | OCI DevOps Build + Deploy Pipelines |
| **Monitoring** | Logs only | OCI Logging + Monitoring + Alerts |

---

## Repository

**GitHub:** https://github.com/MariaGpeSotoAcosta/oci_devops_project/tree/develop

| File | Purpose |
|------|---------|
| `MtdrSpring/backend/Dockerfile` | Container definition |
| `MtdrSpring/backend/src/main/resources/todolistapp-springboot.yaml` | K8s template (has `%PLACEHOLDERS%`) |
| `MtdrSpring/backend/src/main/java/.../security/WebSecurityConfiguration.java` | Spring Security config (patched in Step 9) |
| `MtdrSpring/backend/wallet/` | Oracle DB wallet — **never commit** |
| `MtdrSpring/backend/src/main/resources/application.properties` | **gitignored — must create manually** |

> **Security reminder:** Never commit to GitHub:
> ```
> MtdrSpring/backend/wallet/
> MtdrSpring/backend/src/main/resources/application.properties
> todolistapp-final.yaml
> ```
