# Commands and messages that will be sent or expected by the BOT

# Commands
START_COMMAND = "/JTDI"
CREATE_TASK = "/NewTask"
CANCEL = "/Cancel"


# Sent Messages
TASK_NAME = "Test Task"
TASK_HOURS = "2"


# Expected Messages
START_RESPONSE = "Hello! I am your Telegram Task Tracker helper bot! Create a new task with /NewTask! Type /ModifyTask to change the attirbutes of a task! Or type /fns to see all the functions you can use!"
WRITE_TASK_NAME = "Please write the name for the task."
WRITE_TASK_HOURS = "Please write expected hours"
TASK_CREATED = "The task was created correctly!"