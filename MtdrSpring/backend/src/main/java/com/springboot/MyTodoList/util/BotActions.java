package com.springboot.MyTodoList.util;

import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.ToDoItemService;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.generics.TelegramClient;

public class BotActions{

    private static final Logger logger = LoggerFactory.getLogger(BotActions.class);

    String requestText;
    long chatId;
    TelegramClient telegramClient;
    boolean exit;

    ToDoItemService todoService;
    DeepSeekService deepSeekService;

    private static final Map<Long, UserSession> sessions = new HashMap<>();

    public BotActions(TelegramClient tc,ToDoItemService ts, DeepSeekService ds){
        telegramClient = tc;
        todoService = ts;
        deepSeekService = ds;
        exit  = false;
    }

    public void setRequestText(String cmd){
        requestText=cmd;
    }

    public void setChatId(long chId){
        chatId=chId;
    }

    public void setTelegramClient(TelegramClient tc){
        telegramClient=tc;
    }

    public void setTodoService(ToDoItemService tsvc){
        todoService = tsvc;
    }

    public ToDoItemService getTodoService(){
        return todoService;
    }

    public void setDeepSeekService(DeepSeekService dssvc){
        deepSeekService = dssvc;
    }

    public DeepSeekService getDeepSeekService(){
        return deepSeekService;
    }

    private UserSession getSession() {
        return sessions.computeIfAbsent(chatId, k -> new UserSession());
    }

    public void fnListMyTasks(){
        if (!(requestText.equals(BotCommands.MY_TASKS.getCommand())) || exit)
            return;

        List<ToDoItem> allItems = todoService.findAll(); // Este service tambn se tiene que cambiar
        StringBuilder msg = new StringBuilder(BotMessages.MY_TASK_SUCC.getMessage());

        for (ToDoItem item : allItems) {
            //msg.append(item.getId() + "\n");
            //msg.append(item.getName() + "\n");
            //msg.append(item.getStatus() + "\n");
        }

        BotHelper.sendMessageToTelegram(chatId, msg.toString(), telegramClient,  null);//
        exit = true;
    }

  


    public void fnElse() {
        UserSession session = getSession();

        if (session.getState() != ConversationState.NONE)
            return;

        BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient, null);
    }


    public boolean handleState() {
        UserSession session = getSession();

        // =========================
        // MODIFY FLOW - STEP 1 (GET ID)
        // =========================
        if (session.getState() == ConversationState.WAITING_ID) {

            session.setTaskId(requestText);

            switch (session.getAction()) {

                case MOD_NAME:
                    session.setState(ConversationState.WAITING_NAME);
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.MOD_NAME.getMessage(), telegramClient, null);
                    break;

                case MOD_STATUS:
                    session.setState(ConversationState.WAITING_STATUS);
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.MOD_STATUS.getMessage(), telegramClient, null);
                    break;

                case MOD_WORKED:
                    session.setState(ConversationState.WAITING_WORKED);
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.MOD_WORKED.getMessage(), telegramClient, null);
                    break;

                case MOD_EXPECTED:
                    session.setState(ConversationState.WAITING_EXPECTED);
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.MOD_EXPECTED.getMessage(), telegramClient, null);
                    break;

                default:
                    return false;
            }

            return true;
        }

        // =========================
        // MODIFY FLOW - STEP 2 (FINAL VALUE)
        // =========================
        if (session.getState() != ConversationState.NONE &&
            session.getAction() != UserAction.CREATE_TASK) {

            String taskId = session.getTaskId();
            String value = requestText;

            switch (session.getAction()) {

                case MOD_NAME:
                    // todoService.updateName(taskId, value);
                    break;

                case MOD_STATUS:
                    // todoService.updateStatus(taskId, value);
                    break;

                case MOD_WORKED:
                    // todoService.updateWorked(taskId, value);
                    break;

                case MOD_EXPECTED:
                    // todoService.updateExpected(taskId, value);
                    break;

                default:
                    return false;
            }

            session.setState(ConversationState.NONE);
            session.setAction(UserAction.NONE);

            BotHelper.sendMessageToTelegram(chatId, "✅ Task updated successfully!", telegramClient, null);

            return true;
        }

        // =========================
        // CREATE TASK - STEP 1 (NAME)
        // =========================
        if (session.getState() == ConversationState.CREATING_NAME) {

            session.setTempName(requestText);
            session.setState(ConversationState.CREATING_EXPECTED);

            BotHelper.sendMessageToTelegram(chatId, "⏱️ Please write expected hours", telegramClient, null);

            return true;
        }

        // =========================
        // CREATE TASK - STEP 2 (EXPECTED HOURS)
        // =========================
        if (session.getState() == ConversationState.CREATING_EXPECTED) {
            try {
                int expected = Integer.parseInt(requestText);
                session.setTempExpected(expected);

                // 🔥 CREATE TASK HERE
                // Example:
                // todoService.createTask(session.getTempName(), expected);

                // cleanup
                session.setTempName(null);
                session.setTempExpected(null);
                session.setState(ConversationState.NONE);
                session.setAction(UserAction.NONE);

                BotHelper.sendMessageToTelegram(chatId, BotMessages.NEW_TASK_SUCC.getMessage(), telegramClient, null);

            } catch (NumberFormatException e) {
                BotHelper.sendMessageToTelegram(chatId, "🚨 Task could not be created!", telegramClient, null);
            }

            return true;
        }

        return false;
    }


    public void fnStart(){
        if (!(requestText.equals(BotCommands.START_COMMAND.getCommand())) || exit)
            return;

        BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient, null);

        exit = true;
    }


    public void fnModfiyTask(){
        if (!(requestText.equals(BotCommands.MOD_TASK.getCommand())) || exit)
            return;

        BotHelper.sendMessageToTelegram(chatId, BotMessages.MOD_TASK_FNS.getMessage(), telegramClient, null);

        exit = true;
    }


    public void fnModifyCommands() {
        UserSession session = getSession();

        if (requestText.equals(BotCommands.MOD_NAME.getCommand())) {
            session.setAction(UserAction.MOD_NAME);

        } else if (requestText.equals(BotCommands.MOD_STATUS.getCommand())) {
            session.setAction(UserAction.MOD_STATUS);

        } else if (requestText.equals(BotCommands.MOD_WORKED.getCommand())) {
            session.setAction(UserAction.MOD_WORKED);

        } else if (requestText.equals(BotCommands.MOD_EXPECTED.getCommand())) {
            session.setAction(UserAction.MOD_EXPECTED);

        } else {
            return;
        }

        session.setState(ConversationState.WAITING_ID);

        BotHelper.sendMessageToTelegram(chatId, BotMessages.MOD_ASK_ID.getMessage(), telegramClient, null);
    }


    public void fnModName() {
        if (!requestText.equals(BotCommands.MOD_NAME.getCommand()))
            return;

        UserSession session = getSession();
        session.setAction(UserAction.MOD_NAME);
        session.setState(ConversationState.WAITING_ID);

        BotHelper.sendMessageToTelegram(chatId, BotMessages.MOD_ASK_ID.getMessage(), telegramClient, null);
    }
    
    
    public void fnModStatus() {
        if (!requestText.equals(BotCommands.MOD_STATUS.getCommand()))
            return;

        UserSession session = getSession();
        session.setAction(UserAction.MOD_STATUS);
        session.setState(ConversationState.WAITING_ID);

        BotHelper.sendMessageToTelegram(chatId, BotMessages.MOD_ASK_ID.getMessage(), telegramClient, null);
    }
    
    
    public void fnModWorked() {
        if (!requestText.equals(BotCommands.MOD_WORKED.getCommand()))
            return;

        UserSession session = getSession();
        session.setAction(UserAction.MOD_WORKED);
        session.setState(ConversationState.WAITING_ID);

        BotHelper.sendMessageToTelegram(chatId, BotMessages.MOD_ASK_ID.getMessage(), telegramClient, null);
    }
    
    
    public void fnModExpected() {
        if (!requestText.equals(BotCommands.MOD_EXPECTED.getCommand()))
            return;

        UserSession session = getSession();
        session.setAction(UserAction.MOD_EXPECTED);
        session.setState(ConversationState.WAITING_ID);

        BotHelper.sendMessageToTelegram(chatId, BotMessages.MOD_ASK_ID.getMessage(), telegramClient, null);
    }


    public void fnNewTask() {
        if (!requestText.equals(BotCommands.NEW_TASK.getCommand()))
            return;

        UserSession session = getSession();

        session.setAction(UserAction.CREATE_TASK);
        session.setState(ConversationState.CREATING_NAME);

        BotHelper.sendMessageToTelegram(chatId, BotMessages.NEW_TASK_1.getMessage(), telegramClient, null);
    }
}
