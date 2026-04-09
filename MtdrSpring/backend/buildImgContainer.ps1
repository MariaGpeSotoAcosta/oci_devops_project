Write-Host "Stopping container..."
docker stop agilecontainer 2>$null

Write-Host "Removing container..."
docker rm agilecontainer 2>$null

Write-Host "Removing old image..."
docker rmi agileimage:0.1 2>$null

Write-Host "Building project..."
mvn clean verify

Write-Host "Building Docker image..."
docker build --no-cache -f DockerfileDev --platform linux/amd64 -t agileimage:0.1 .

Write-Host "Running container..."
docker run --name agilecontainer -p 8080:8080 -d agileimage:0.1

Write-Host "Done 🚀"