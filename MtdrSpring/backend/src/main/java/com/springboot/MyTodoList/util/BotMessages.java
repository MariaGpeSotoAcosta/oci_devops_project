package com.springboot.MyTodoList.util;

public enum BotMessages {

    // ── Welcome ───────────────────────────────────────────────────
    HELLO_MYTODO_BOT(
        "👋 Hello! I am your JTDI Task Bot!\n\n" +
        "🔗 First, link your account: /ConfigUser\n\n" +
        "Then you can use:\n" +
        "📋 /NewTask        — create a task\n" +
        "📝 /MyTasks        — see your tasks\n" +
        "✏️ /ModifyTask     — modify a task\n" +
        "❓ /fns            — see all commands"
    ),
    BOT_REGISTERED_STARTED("Bot registered and started successfully!"),

    // Legacy (kept for compatibility)
    ITEM_DONE("Item done! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
    ITEM_UNDONE("Item undone!"),
    ITEM_DELETED("Item deleted!"),
    TYPE_NEW_TODO_ITEM("Type a new todo item below and press send."),
    NEW_ITEM_ADDED("New item added!"),
    BYE("Bye! Select /JTDI to resume!"),

    // ── Status labels (also used as keyboard button text) ─────────
    TASK_OPEN("📭 Open"),
    TASK_PROGRESS("⏳ In Progress"),
    TASK_COMPLETE("✅ Completed"),

    // ── General emojis ────────────────────────────────────────────
    TASK("📋"),
    KEY("🔑"),
    USER("👤"),

    // ── /ConfigUser ───────────────────────────────────────────────
    CONFIG_USER_1(
        "✏️ Please write your JoinCode!\n" +
        "🔑 Generate one from Settings in the web app.\n" +
        "🤖 Write only the code, no extra text!"
    ),
    // We keep CONFIG_USER_1 as reference; the bot actually sends CONFIG_USER_1
    CONFIG_USER_2(
        "🔑 Please paste your Join Code from the web app.\n\n" +
        "👉 Go to Settings → Generate Join Code, then paste it here.\n" +
        "⚠️ Codes expire after 15 minutes and can only be used once."
    ),
    CONFIG_FAIL(
        "🚨 That code is invalid, expired, or already used.\n" +
        "👉 Generate a new one in Settings and try /ConfigUser again."
    ),
    CONFIG_SUCC("✅ Your Telegram account has been linked successfully!"),

    // ── /MyTasks ──────────────────────────────────────────────────
    MY_TASK_FAIL("❗ You have no tasks assigned to you."),
    MY_TASK_SUCC("📋 Your assigned tasks:\n"),

    // ── /AllTasks ─────────────────────────────────────────────────
    ALL_TASKS_FAIL("Could not retrieve tasks!"),
    ALL_TASKS_SUCC("ID | Summary | Status"),

    // ── Modify — common ───────────────────────────────────────────
    MOD_ASK_ID("🔑 Please write the ID of the task you want to modify."),
    MOD_TASK_VAGUE("✅ Task updated successfully!"),
    MOD_TASK_FNS(
        "What would you like to modify?\n\n" +
        "📝 /ModName       — rename the task\n" +
        "🔋 /ModStatus     — change status\n" +
        "⏱️ /ModWorked     — set worked hours\n" +
        "⏱️ /ModExpected   — set expected hours"
    ),

    // ── /ModName ──────────────────────────────────────────────────
    MOD_NAME("📝 Please write the new name for the task."),
    MOD_NAME_FAIL("🚨 Name could not be modified!"),
    MOD_NAME_SUCC_1("⭕ Old Name:\n"),
    MOD_NAME_SUCC_2("✅ New Name:\n"),

    // ── /ModStatus ────────────────────────────────────────────────
    MOD_STATUS("🔋 Please select the new status using the keyboard below."),
    MOD_STATUS_FAIL("🚨 Status could not be modified!"),
    MOD_STATUS_SUCC_1("⭕ Old Status:\n"),
    MOD_STATUS_SUCC_2("✅ New Status:\n"),

    // ── /ModWorked ────────────────────────────────────────────────
    MOD_WORKED("⏱️ Please write the new number of worked hours."),
    MOD_WORKED_FAIL("🚨 Worked hours could not be modified!"),
    MOD_WORKED_SUCC_1("⭕ Old Worked:\n"),
    MOD_WORKED_SUCC_2("✅ New Worked:\n"),

    // ── /ModExpected ──────────────────────────────────────────────
    MOD_EXPECTED("⏱️ Please write the new expected hours (story points)."),
    MOD_EXPECTED_FAIL("🚨 Expected hours could not be modified!"),
    MOD_EXPECTED_SUCC_1("⭕ Old Expected:\n"),
    MOD_EXPECTED_SUCC_2("✅ New Expected:\n"),

    // ── /NewTask ──────────────────────────────────────────────────
    NEW_TASK_1("👉 Please write the name (title) for the new task."),
    NEW_TASK_2("⏱️ How many hours do you expect this task to take?"),
    NEW_TASK_3("💼 Please click the assignee."),
    NEW_TASK_FAIL("🚨 Task could not be created!"),
    NEW_TASK_SUCC("✅ Task created successfully!\n");

    private final String message;

    BotMessages(String enumMessage) {
        this.message = enumMessage;
    }

    public String getMessage() {
        return message;
    }
}