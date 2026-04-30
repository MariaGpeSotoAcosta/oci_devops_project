package com.springboot.MyTodoList.util;

import com.springboot.MyTodoList.dto.CreateTaskRequest;
import com.springboot.MyTodoList.dto.ProjectDTO;
import com.springboot.MyTodoList.dto.TaskDTO;
import com.springboot.MyTodoList.dto.UpdateTaskRequest;
import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.service.JoinCodeService;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.ProjectService;
import com.springboot.MyTodoList.service.TaskService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

/**
 * Central class that handles every Telegram command and conversation state.
 *
 * ═══════════════════════════════════════════════════════════════
 *  FLOW OVERVIEW
 * ═══════════════════════════════════════════════════════════════
 *
 *  /ConfigUser
 *    └─ bot asks for join code
 *    └─ user pastes code from web app (Settings → Generate Join Code)
 *    └─ bot verifies: not expired, not used → marks used, saves chatId to AppUser
 *
 *  /NewTask
 *    └─ bot asks for task title
 *    └─ bot shows project keyboard (fetched from user's projects)
 *    └─ user taps a project
 *    └─ bot asks for expected hours
 *    └─ task saved via TaskService → visible immediately on web app
 *
 *  /MyTasks
 *    └─ lists all tasks assigned to the linked user
 *
 *  /ModifyTask  (shows sub-menu)
 *  /ModName     → ask ID → ask new name  → update
 *  /ModStatus   → ask ID → show keyboard → update
 *  /ModWorked   → ask ID → ask hours     → update
 *  /ModExpected → ask ID → ask hours     → update
 * ═══════════════════════════════════════════════════════════════
 */
public class BotActions {

    private static final Logger logger = LoggerFactory.getLogger(BotActions.class);

    // ── Per-user sessions (static → survives across messages) ─────
    private static final Map<Long, UserSession> sessions = new HashMap<>();

    // ── Injected dependencies ─────────────────────────────────────
    private final TelegramClient      telegramClient;
    private final TaskService         taskService;
    private final DeepSeekService     deepSeekService;
    private final AppUserRepository   userRepository;
    private final JoinCodeService     joinCodeService;
    private final ProjectService      projectService;

    // ── Per-message context ───────────────────────────────────────
    private String  requestText;
    private long    chatId;
    private boolean exit = false;

    // ── Constructor ───────────────────────────────────────────────

    public BotActions(TelegramClient telegramClient,
                      TaskService taskService,
                      DeepSeekService deepSeekService,
                      AppUserRepository userRepository,
                      JoinCodeService joinCodeService,
                      ProjectService projectService) {
        this.telegramClient     = telegramClient;
        this.taskService        = taskService;
        this.deepSeekService    = deepSeekService;
        this.userRepository     = userRepository;
        this.joinCodeService     = joinCodeService;
        this.projectService     = projectService;
    }

    // ── Setters ───────────────────────────────────────────────────

    public void setRequestText(String text) { this.requestText = text; }
    public void setChatId(long chatId)      { this.chatId = chatId; }

    // ── Session helpers ───────────────────────────────────────────

    private UserSession getSession() {
        return sessions.computeIfAbsent(chatId, k -> new UserSession());
    }

    /**
     * Guard: if the user has not linked their account, sends an error and
     * sets exit=true so no further fnXxx() methods run.
     * @return true if NOT linked (caller should return immediately)
     */
    private boolean requireLinked() {
        UserSession session = getSession();
        if (!session.isLinked()) {
            // Recover session: check DB in case server restarted
            Optional<AppUser> dbUser = userRepository.findByTelegramChatId(chatId);
            if (dbUser.isPresent()) {
                session.setAppUserId(dbUser.get().getId());
                return false;
            }
            send("⚠️ Your Telegram account is not linked yet.\n" +
                 "Use /ConfigUser to link it.");
            exit = true;
            return true;
        }
        return false;
    }

    // ── Message helpers ───────────────────────────────────────────

    private void send(String text) {
        BotHelper.sendMessageToTelegram(chatId, text, telegramClient, null);
    }

    private void sendKb(String text, ReplyKeyboardMarkup keyboard) {
        BotHelper.sendMessageToTelegram(chatId, text, telegramClient, keyboard);
    }

    // ═════════════════════════════════════════════════════════════
    //  PUBLIC ENTRY POINTS  (called from ToDoItemBotController)
    // ═════════════════════════════════════════════════════════════

    /** /JTDI — welcome message */
    public void fnStart() {
        if (!requestText.equals(BotCommands.START_COMMAND.getCommand()) || exit) return;
        send(BotMessages.HELLO_MYTODO_BOT.getMessage());
        exit = true;
    }

    /** /ConfigUser — begin join-code verification flow */
    public void fnConfigUser() {
        if (!requestText.equals(BotCommands.CONFIG_USER.getCommand()) || exit) return;

        UserSession session = getSession();
        session.setState(ConversationState.CONFIG_WAITING_CODE);
        session.setAction(UserAction.NONE);

        send(BotMessages.CONFIG_USER_2.getMessage());
        exit = true;
    }

    /** /ModifyTask — show the modify sub-menu */
    public void fnModifyTask() {
        if (!requestText.equals(BotCommands.MOD_TASK.getCommand()) || exit) return;
        if (requireLinked()) return;
        send(BotMessages.MOD_TASK_FNS.getMessage());
        exit = true;
    }

    /** /ModName */
    public void fnModName() {
        if (!requestText.equals(BotCommands.MOD_NAME.getCommand()) || exit) return;
        if (requireLinked()) return;
        UserSession s = getSession();
        s.setAction(UserAction.MOD_NAME);
        s.setState(ConversationState.WAITING_ID);
        send(BotMessages.MOD_ASK_ID.getMessage());
    }

    /** /ModStatus */
    public void fnModStatus() {
        if (!requestText.equals(BotCommands.MOD_STATUS.getCommand()) || exit) return;
        if (requireLinked()) return;
        UserSession s = getSession();
        s.setAction(UserAction.MOD_STATUS);
        s.setState(ConversationState.WAITING_ID);
        send(BotMessages.MOD_ASK_ID.getMessage());
    }

    /** /ModWorked */
    public void fnModWorked() {
        if (!requestText.equals(BotCommands.MOD_WORKED.getCommand()) || exit) return;
        if (requireLinked()) return;
        UserSession s = getSession();
        s.setAction(UserAction.MOD_WORKED);
        s.setState(ConversationState.WAITING_ID);
        send(BotMessages.MOD_ASK_ID.getMessage());
    }

    /** /ModExpected */
    public void fnModExpected() {
        if (!requestText.equals(BotCommands.MOD_EXPECTED.getCommand()) || exit) return;
        if (requireLinked()) return;
        UserSession s = getSession();
        s.setAction(UserAction.MOD_EXPECTED);
        s.setState(ConversationState.WAITING_ID);
        send(BotMessages.MOD_ASK_ID.getMessage());
    }

    /** /NewTask — begin task creation flow */
    public void fnNewTask() {
        if (!requestText.equals(BotCommands.NEW_TASK.getCommand()) || exit) return;
        if (requireLinked()) return;

        UserSession s = getSession();
        s.setAction(UserAction.CREATE_TASK);
        s.setState(ConversationState.CREATING_NAME);

        send(BotMessages.NEW_TASK_1.getMessage());
    }

    /** /MyTasks — list tasks assigned to this user */
    public void fnListMyTasks() {
        if (!requestText.equals(BotCommands.MY_TASKS.getCommand()) || exit) return;
        if (requireLinked()) return;

        Long userId = getSession().getAppUserId();
        if (userId == null) {
            send("\u26A0\uFE0F Could not identify your account. Please use /ConfigUser again.");
            return;
        }

        try {
            List<TaskDTO> tasks = taskService.getTasksForUser(userId);
            if (tasks.isEmpty()) {
                send(BotMessages.MY_TASK_FAIL.getMessage());
            } else {
                StringBuilder sb = new StringBuilder(BotMessages.MY_TASK_SUCC.getMessage());
                for (TaskDTO t : tasks) {
                    sb.append("\n")
                      .append("🔑 ").append(t.getId()).append("\n")
                      .append("📋 ").append(t.getTitle()).append("\n")
                      .append("🔋 ").append(formatStatus(t.getStatus())).append("\n")
                      .append("────────────────\n");
                }
                send(sb.toString());
            }
        } catch (Exception e) {
            logger.error("Error fetching tasks for chatId {}: {}", chatId, e.getMessage(), e);
            send("❌ Could not retrieve your tasks. Please try again later.");
        }
        exit = true;
    }

    /** Fallback — no command matched and no active conversation state */
    public void fnElse() {
        if (exit) return;
        UserSession session = getSession();
        if (session.getState() != ConversationState.NONE) return;
        send(BotMessages.HELLO_MYTODO_BOT.getMessage());
    }

    // ═════════════════════════════════════════════════════════════
    //  STATE MACHINE
    //  Call this BEFORE fnXxx methods.
    //  Returns true → a state was handled, skip remaining fn calls.
    // ═════════════════════════════════════════════════════════════

    public boolean handleState() {
        UserSession session = getSession();

        switch (session.getState()) {

            // ── /ConfigUser: user pastes join code ────────────────
            case CONFIG_WAITING_CODE:
                return handleConfigCode(session);

            // ── /NewTask step 1: user types task name ─────────────
            case CREATING_NAME:
                return handleCreatingName(session);

            // ── /NewTask step 2: user taps a project button ───────
            case CREATING_SELECTING_PROJECT:
                return handleCreatingProjectSelection(session);

            // ── /NewTask step 3: user types expected hours ────────
            case CREATING_EXPECTED:
                return handleCreatingExpected(session);

            // ── Modify step 1: user types task ID ────────────────
            case WAITING_ID:
                return handleWaitingId(session);

            // ── Modify step 2: user types/taps new value ─────────
            case WAITING_NAME:
            case WAITING_STATUS:
            case WAITING_WORKED:
            case WAITING_EXPECTED:
                return handleModifyValue(session);

            default:
                return false;
        }
    }

    // ═════════════════════════════════════════════════════════════
    //  PRIVATE STATE HANDLERS
    // ═════════════════════════════════════════════════════════════

    /**
     * /ConfigUser flow — user pastes the join code.
     * Validates against JOIN_CODE table: must exist, not expired, not used.
     * On success: saves chatId to AppUser, marks code as used.
     */
    private boolean handleConfigCode(UserSession session) {
        String code = requestText.trim();

        try {
            // linkTelegramAccount is @Transactional so both saves commit together
            AppUser user = joinCodeService.linkTelegramAccount(code, chatId);

            session.setAppUserId(user.getId());
            session.resetConversation();

            send(BotMessages.CONFIG_SUCC.getMessage() +
                 "\n Welcome, " + user.getName() + "!\n\n" +
                 "You can now use:\n" +
                 "/NewTask  - create a task\n" +
                 "/MyTasks  - see your tasks\n" +
                 "/ModifyTask - modify a task");

        } catch (RuntimeException e) {
            logger.warn("ConfigUser failed for chatId {}: {}", chatId, e.getMessage());
            send(BotMessages.CONFIG_FAIL.getMessage());
            session.resetConversation();
        }

        return true;
    }

    /**
     * /NewTask step 1 — user types the task title.
     * Then fetches the user's projects and shows them as a keyboard.
     */
    private boolean handleCreatingName(UserSession session) {
        String name = requestText.trim();
        if (name.isEmpty()) {
            send("⚠️ Task name cannot be empty. Please write a name:");
            return true;
        }

        session.setTempName(name);

        // Fetch projects for this user
        Long userId = session.getAppUserId();
        List<ProjectDTO> projects;
        try {
            projects = projectService.getUserProjects(userId);
        } catch (Exception e) {
            logger.error("Error fetching projects for user {}: {}", userId, e.getMessage(), e);
            send("❌ Could not fetch your projects. Please try again.");
            session.resetConversation();
            return true;
        }

        if (projects.isEmpty()) {
            send("⚠️ You don't have any projects yet.\n" +
                 "Create one in the web app first, then try /NewTask again.");
            session.resetConversation();
            return true;
        }

        // Build label → projectId map and keyboard
        Map<String, String> choices = new LinkedHashMap<>();
        List<KeyboardRow>   rows    = new ArrayList<>();

        for (ProjectDTO p : projects) {
            String label = "📁 " + p.getName();
            choices.put(label, p.getId());
            KeyboardRow row = new KeyboardRow();
            row.add(label);
            rows.add(row);
        }

        session.setProjectChoices(choices);
        session.setState(ConversationState.CREATING_SELECTING_PROJECT);

        ReplyKeyboardMarkup kb = new ReplyKeyboardMarkup(rows);
        kb.setResizeKeyboard(true);
        kb.setOneTimeKeyboard(true);

        sendKb("📁 Please select the project for this task:", kb);
        return true;
    }

    /**
     * /NewTask step 2 — user taps a project button.
     */
    private boolean handleCreatingProjectSelection(UserSession session) {
        String label     = requestText.trim();
        String projectId = session.getProjectChoices().get(label);

        if (projectId == null) {
            // User typed something that isn't one of the keyboard buttons
            send("⚠️ Please tap one of the project buttons shown.");
            return true;
        }

        session.setTempProjectId(projectId);
        session.setState(ConversationState.CREATING_EXPECTED);

        send("⏱️ How many hours do you expect this task to take? (story points)");
        return true;
    }

    /**
     * /NewTask step 3 — user types expected hours, task is created.
     */
    private boolean handleCreatingExpected(UserSession session) {
        int expected;
        try {
            expected = Integer.parseInt(requestText.trim());
            if (expected < 0) throw new NumberFormatException();
        } catch (NumberFormatException e) {
            send("🚨 Please enter a valid positive number.");
            return true;
        }

        Long   userId    = session.getAppUserId();
        String projectId = session.getTempProjectId();

        CreateTaskRequest req = new CreateTaskRequest();
        req.setTitle(session.getTempName());
        req.setStoryPoints(expected);
        req.setProjectId(projectId);
        req.setAssigneeId(userId.toString()); // assigned to self by default
        req.setPriority("medium");
        req.setType("task");

        try {
            TaskDTO created = taskService.createTask(userId, req);
            send(BotMessages.NEW_TASK_SUCC.getMessage() +
                 "🔑 ID: "     + created.getId()    + "\n" +
                 "📋 Title: "  + created.getTitle() + "\n" +
                 "⏱️ Points: " + expected            + "\n\n" +
                 "The task is now visible on the web app! 🎉");
        } catch (Exception e) {
            logger.error("Error creating task for user {}: {}", userId, e.getMessage(), e);
            send(BotMessages.NEW_TASK_FAIL.getMessage());
        }

        session.resetConversation();
        return true;
    }

    /**
     * Modify flow step 1 — user sends the task ID.
     */
    private boolean handleWaitingId(UserSession session) {
        String rawId = requestText.trim();

        // Validate numeric ID before accepting it
        try {
            Long.parseLong(rawId);
        } catch (NumberFormatException e) {
            send("\uD83D\uDEA8 Please write a numeric task ID (e.g. 44).");
            return true;
        }

        session.setTaskId(rawId);

        switch (session.getAction()) {
            case MOD_NAME:
                session.setState(ConversationState.WAITING_NAME);
                send(BotMessages.MOD_NAME.getMessage());
                break;
            case MOD_STATUS:
                session.setState(ConversationState.WAITING_STATUS);
                sendKb(BotMessages.MOD_STATUS.getMessage(), buildStatusKeyboard());
                break;
            case MOD_WORKED:
                session.setState(ConversationState.WAITING_WORKED);
                send(BotMessages.MOD_WORKED.getMessage());
                break;
            case MOD_EXPECTED:
                session.setState(ConversationState.WAITING_EXPECTED);
                send(BotMessages.MOD_EXPECTED.getMessage());
                break;
            default:
                return false;
        }
        return true;
    }

    /**
     * Modify flow step 2 — user provides the new value, we call TaskService.
     */
    private boolean handleModifyValue(UserSession session) {
        Long taskId;
        try {
            taskId = Long.parseLong(session.getTaskId());
        } catch (NumberFormatException e) {
            send("🚨 Invalid task ID: \"" + session.getTaskId() + "\". Please use a numeric ID.");
            session.resetConversation();
            return true;
        }

        Long userId = session.getAppUserId();
        UpdateTaskRequest req = new UpdateTaskRequest();

        switch (session.getAction()) {

            case MOD_NAME:
                String newName = requestText.trim();
                if (newName.isEmpty()) {
                    send("⚠️ Name cannot be empty.");
                    return true;
                }
                req.setTitle(newName);
                break;

            case MOD_STATUS:
                String normalized = normalizeStatus(requestText.trim());
                if (normalized == null) {
                    send("🚨 Unrecognized status. Please tap one of the keyboard buttons.");
                    return true;
                }
                req.setStatus(normalized);
                break;

            case MOD_WORKED:
                try {
                    req.setWorkedHours(Integer.parseInt(requestText.trim()));
                } catch (NumberFormatException e) {
                    send("🚨 Please enter a valid number of hours.");
                    return true;
                }
                break;

            case MOD_EXPECTED:
                try {
                    req.setStoryPoints(Integer.parseInt(requestText.trim()));
                } catch (NumberFormatException e) {
                    send("🚨 Please enter a valid number of hours.");
                    return true;
                }
                break;

            default:
                return false;
        }

        try {
            TaskDTO updated = taskService.updateTask(userId, taskId, req);
            send("✅ Task updated!\n" +
                 "🔑 ID: "    + updated.getId()     + "\n" +
                 "📋 "        + updated.getTitle()  + "\n" +
                 "🔋 "        + formatStatus(updated.getStatus()));
        } catch (Exception e) {
            logger.error("Error updating task {} for user {}: {}", taskId, userId, e.getMessage(), e);
            send("🚨 Could not update the task. Make sure the ID is correct and try again.");
        }

        session.resetConversation();
        return true;
    }

    // ═════════════════════════════════════════════════════════════
    //  KEYBOARD BUILDERS & HELPERS
    // ═════════════════════════════════════════════════════════════

    private ReplyKeyboardMarkup buildStatusKeyboard() {
        KeyboardRow row = new KeyboardRow();
        row.add(BotMessages.TASK_OPEN.getMessage());
        row.add(BotMessages.TASK_PROGRESS.getMessage());
        row.add(BotMessages.TASK_COMPLETE.getMessage());

        List<KeyboardRow> rows = new ArrayList<>();
        rows.add(row);

        ReplyKeyboardMarkup markup = new ReplyKeyboardMarkup(rows);
        markup.setResizeKeyboard(true);
        markup.setOneTimeKeyboard(true);
        return markup;
    }

    /** Maps user-visible button labels and common strings to DB status values. */
    private String normalizeStatus(String raw) {
        switch (raw.toLowerCase().replace(" ", "-")) {
            case "todo": case "open": case "📭-open":
            case "📭 open":
                return "todo";
            case "in-progress": case "inprogress": case "in progress":
            case "⏳-in-progress": case "⏳ in progress":
                return "in-progress";
            case "done": case "completed": case "complete":
            case "✅-completed": case "✅ completed":
                return "done";
            default:
                return null;
        }
    }

    private String formatStatus(String status) {
        if (status == null) return "—";
        switch (status) {
            case "todo":        return BotMessages.TASK_OPEN.getMessage();
            case "in-progress": return BotMessages.TASK_PROGRESS.getMessage();
            case "done":        return BotMessages.TASK_COMPLETE.getMessage();
            default:            return status;
        }
    }
}