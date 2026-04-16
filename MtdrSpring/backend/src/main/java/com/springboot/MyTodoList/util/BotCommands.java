package com.springboot.MyTodoList.util;

public enum BotCommands {

	START_COMMAND("/JTDI"),
	CONFIG_USER("/ConfigUser"),
	TASK_FUNCS("/TaskFunctions"),
	MY_TASKS("/MyTasks"),
	ALL_TASKS("AllTasks"),
	MOD_TASK("/ModifyTask"),
	MOD_NAME("/ModName"),
	MOD_STATUS("/ModStatus"),
	MOD_WORKED("/ModWorked"),
	MOD_EXPECTED("/ModExpected"),
	NEW_TASK("/NewTask"),
	SHOW_FUNCS("/fns");

	private String command;

	BotCommands(String enumCommand) {
		this.command = enumCommand;
	}

	public String getCommand() {
		return command;
	}
}
