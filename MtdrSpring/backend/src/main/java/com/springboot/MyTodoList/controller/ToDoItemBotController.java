package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.config.BotProps;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.service.JoinCodeService;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.ProjectService;
import com.springboot.MyTodoList.service.TaskService;
import com.springboot.MyTodoList.util.BotActions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.client.okhttp.OkHttpTelegramClient;
import org.telegram.telegrambots.longpolling.BotSession;
import org.telegram.telegrambots.longpolling.interfaces.LongPollingUpdateConsumer;
import org.telegram.telegrambots.longpolling.starter.AfterBotRegistration;
import org.telegram.telegrambots.longpolling.starter.SpringLongPollingBot;
import org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
public class ToDoItemBotController
        implements SpringLongPollingBot, LongPollingSingleThreadUpdateConsumer {

    private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);

    private final BotProps           botProps;
    private final TaskService        taskService;
    private final DeepSeekService    deepSeekService;
    private final AppUserRepository  userRepository;
    private final JoinCodeService    joinCodeService;
    private final ProjectService     projectService;
    private final TelegramClient     telegramClient;

    public ToDoItemBotController(BotProps botProps,
                                 TaskService taskService,
                                 DeepSeekService deepSeekService,
                                 AppUserRepository userRepository,
                                 JoinCodeService joinCodeService,
                                 ProjectService projectService) {
        this.botProps           = botProps;
        this.taskService        = taskService;
        this.deepSeekService    = deepSeekService;
        this.userRepository     = userRepository;
        this.joinCodeService    = joinCodeService;
        this.projectService     = projectService;
        this.telegramClient     = new OkHttpTelegramClient(botProps.getToken());
    }

    @Override
    public String getBotToken() {
        return botProps.getToken();
    }

    @Override
    public LongPollingUpdateConsumer getUpdatesConsumer() {
        return this;
    }

    @Override
    public void consume(Update update) {
        if (!update.hasMessage() || !update.getMessage().hasText()) return;

        String messageText = update.getMessage().getText();
        long   chatId      = update.getMessage().getChatId();

        // BotActions is stateless per message; session state lives in a static Map.
        BotActions actions = new BotActions(
                telegramClient,
                taskService,
                deepSeekService,
                userRepository,
                joinCodeService,
                projectService
        );
        actions.setRequestText(messageText);
        actions.setChatId(chatId);

        // ── Multi-step state machine first ────────────────────────
        if (actions.handleState()) {
            return;
        }

        // ── Single-step commands ──────────────────────────────────
        actions.fnStart();
        actions.fnConfigUser();
        actions.fnModifyTask();
        actions.fnModName();
        actions.fnModStatus();
        actions.fnModWorked();
        actions.fnModExpected();
        actions.fnNewTask();
        actions.fnListMyTasks();
        actions.fnElse();   // must be last
    }

    @AfterBotRegistration
    public void afterRegistration(BotSession botSession) {
        System.out.println("Registered bot running state is: " + botSession.isRunning());
    }
}