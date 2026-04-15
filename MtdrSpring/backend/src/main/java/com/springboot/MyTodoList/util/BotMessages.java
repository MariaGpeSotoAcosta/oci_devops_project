package com.springboot.MyTodoList.util;

public enum BotMessages {
	
	// Premade messages
	HELLO_MYTODO_BOT("Hello! I am your Telegram Task Tracker helper bot! Type /fns to see all the functions you can do!"),
	BOT_REGISTERED_STARTED("Bot registered and started succesfully!"),
	ITEM_DONE("Item done! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_UNDONE("Item undone! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_DELETED("Item deleted! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_NEW_TODO_ITEM("Type a new todo item below and press the send button (blue arrow) on the rigth-hand side."),
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

	MY_TASK_SUCC("ID | Summary | Status\n"), // Este tiene que tener un map de estos mensajes anadido "📋 <id> <name> <📭 Open | ⏳ In Progress>"


	// /AllTasks
	ALL_TASKS_FAIL("Could not retrieve tasks!"),

	ALL_TASKS_SUCC("ID | Summary | Status"), // "spiral notepad <id>  <assignee | bust in silhouette unassigned>  <name>  <open book Open | hourglass not done In Progress>"


	// |-- Modify Existing Tasks--|
	// Common messages
	MOD_ASK_ID("key Please write the ID of the task."),


	///ModName
	MOD_NAME("memo Please write the new name for the task."),

	MOD_NAME_FAIL("police car light Name could not be modified!"),

	MOD_NAME_SUCC_1("hollow red circle Old Name:\n"),
				  
	MOD_NAME_SUCC_2("check mark button New Name:\n"),


	// /ModStauts
	MOD_STATUS("battery  Please click the new status."),

	MOD_STATUS_FAIL("police car light Status could not be modified!"),

	MOD_STATUS_SUCC_1("hollow red circle Old Status:\n"),

	MOD_STATUS_SUCC_2("check mark button New Status:\n"),

	
	// /ModWorked
	MOD_WORKED("clock Please write the new worked hours"),

	MOD_WORKED_FAIL("police car light Worked could not be modified!"),

	MOD_WORKED_SUCC_1("hollow red circle Old Worked:\n"),

	MOD_WORKED_SUCC_2("check mark button New Worked:\n"),


	// /ModExpected
	MOD_EXPECTED("clock Please write the new expected hours"),

	MOD_EXPECTED_FAIL("police car light Expected could not be modified!"),

	MOD_EXPECTED_SUCC_1("hollow red circle Old Expected:\n"),

	MOD_EXPECTED_SUCC_2("check mark button New Expected:\n"),


	// /NewTask
	NEW_TASK_1("👉 Please write the name for the task."),

	NEW_TASK_2("💼 Please click the assignee."),

	NEW_TASK_FAIL("🚨 Task could not be created!"),

	NEW_TASK_SUCC("✅ The task was created correctly!\n"); // Debe tener anadido "🔑 <ID> 📝 <Name> 👤 <Assignee> 📭 Open"

	private String message;

	BotMessages(String enumMessage) {
		this.message = enumMessage;
	}

	public String getMessage() {
		return message;
	}

}
