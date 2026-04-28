# Commands and messages for Telegram bot tests

# Commands
START_COMMAND = "/JTDI"
CREATE_TASK   = "/NewTask"
CANCEL        = "/Cancel"
MY_TASKS      = "/MyTasks"
MOD_TASK      = "/ModifyTask"
MOD_NAME      = "/ModName"
MOD_STATUS    = "/ModStatus"

# Sent by test
TASK_NAME    = "Test Task Selenium"
TASK_HOURS   = "2"
PROJECT_NAME = "PROJECTO1"   # Must match exactly the project button shown by bot

# Expected bot responses
START_RESPONSE    = "Hello! I am your JTDI Task Bot!"
WRITE_TASK_NAME   = "Please write the name (title) for the new task."
SELECT_PROJECT    = "Please select the project for this task"
WRITE_TASK_HOURS  = "How many hours do you expect this task to take?"
TASK_CREATED      = "Task created successfully!"
CANCEL_RESPONSE   = "Operation cancelled."
NOT_LINKED        = "not linked"
MY_TASKS_RESPONSE = "Your assigned tasks"
MOD_TASK_MENU     = "What would you like to modify?"
MOD_ASK_ID        = "Please write the ID of the task you want to modify."