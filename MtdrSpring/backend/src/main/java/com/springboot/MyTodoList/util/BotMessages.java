package com.springboot.MyTodoList.util;

public enum BotMessages {

    // Premade messages
    HELLO_MYTODO_BOT("Hello! I am your Telegram Task Tracker helper bot! Create a new task with /NewTask! Type /ModifyTask to change the attirbutes of a task! Or type /fns to see all the functions you can use!"),
    BOT_REGISTERED_STARTED("Bot registered and started succesfully!"),
    ITEM_DONE("Item done! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
    ITEM_UNDONE("Item undone! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
    ITEM_DELETED("Item deleted! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
    TYPE_NEW_TODO_ITEM("Type a new todo item below and press the send button (blue arrow) on the right-hand side."),
    NEW_ITEM_ADDED("New item added! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
    BYE("Bye! Select /JTDI to resume!"),

    // Task Status
    TASK_OPEN("📭 Open"),
    TASK_PROGRESS("⏳ In Progress"),
    TASK_COMPLETE("✅ Completed"),

    // General Emojis
    TASK("📋"),
    KEY("🔑"),
    USER("👤"),

    // /Cancel
    CANCELLED("❌ Operation cancelled."),

    // /ConfigUser
    CONFIG_USER_1("✏️ Please write your JoinCode!\n" +
            	  "🔑 If you don't have a JoinCode you can generate one in the web page.\n" +
            	  "🤖 Please be sure to only write the code with no additional text!"),

    CONFIG_USER_2("📧 Please write your email!\n" +
            	  "🤖 Please be sure to only write the email with no additional text!"),

    CONFIG_FAIL("🚨 Your email or JoinCode was incorrect!\n" +
            	"🕵️ Make sure your values are correct.\n" +
            	"👉 If you previously used your JoinCode you will need to generate a new one!"),

    CONFIG_SUCC("✅ Your account was verified correctly!"),

    // /MyTasks
    MY_TASK_FAIL("❗ You have no tasks assigned!"),
    MY_TASK_SUCC("ID | Summary | Status\n"),

    // /AllTasks
    ALL_TASKS_FAIL("Could not retrieve tasks!"),
    ALL_TASKS_SUCC("ID | Summary | Status"),

    // |-- Modify Existing Tasks--|
    // Common messages
    MOD_ASK_ID("🔑 Please write the ID of the task."),
	MOD_TASK_VAGUE("✅ Task updated successfully!"),

    // /ModifyTask
    MOD_TASK_FNS("📝 Modify name: /ModName\n" +
            	 "🔋 Modify status: /ModStatus\n" +
            	 "⏱️ Modify worked: /ModWorked\n" +
            	 "⏱️ Modify expected: /ModExpected"),

    // /ModName
    MOD_NAME("📝 Please write the new name for the task."),
    MOD_NAME_FAIL("🚨 Name could not be modified!"),
    MOD_NAME_SUCC_1("⭕ Old Name:\n"),
    MOD_NAME_SUCC_2("✅ New Name:\n"),

    // /ModStatus
    MOD_STATUS("🔋 Please click the new status."),
    MOD_STATUS_FAIL("🚨 Status could not be modified!"),
    MOD_STATUS_SUCC_1("⭕ Old Status:\n"),
    MOD_STATUS_SUCC_2("✅ New Status:\n"),

    // /ModWorked
    MOD_WORKED("⏱️ Please write the new worked hours"),
    MOD_WORKED_FAIL("🚨 Worked could not be modified!"),
    MOD_WORKED_SUCC_1("⭕ Old Worked:\n"),
    MOD_WORKED_SUCC_2("✅ New Worked:\n"),

    // /ModExpected
    MOD_EXPECTED("⏱️ Please write the new expected hours"),
    MOD_EXPECTED_FAIL("🚨 Expected could not be modified!"),
    MOD_EXPECTED_SUCC_1("⭕ Old Expected:\n"),
    MOD_EXPECTED_SUCC_2("✅ New Expected:\n"),

    // /NewTask
    NEW_TASK_1("👉 Please write the name for the task."),
	NEW_TASK_2("⏱️ How long is this task expected to take to comlpete?"),
    NEW_TASK_3("💼 Please click the assignee."),
    NEW_TASK_FAIL("🚨 Task could not be created!"),
    NEW_TASK_SUCC("✅ The task was created correctly!\n");

    private String message;

    BotMessages(String enumMessage) {
        this.message = enumMessage;
    }

    public String getMessage() {
        return message;
    }
}