package com.springboot.MyTodoList.util;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Per-user conversation state, stored in a static Map keyed by chatId.
 * One instance survives the lifetime of the JVM process.
 */
public class UserSession {

    // ── Conversation control ──────────────────────────────────────
    private ConversationState state  = ConversationState.NONE;
    private UserAction        action = UserAction.NONE;

    // ── Modify-task temps ─────────────────────────────────────────
    private String taskId;          // task ID being modified

    // ── Create-task temps ─────────────────────────────────────────
    private String  tempName;       // title typed by user
    private Integer tempExpected;   // story points typed by user
    private String  tempProjectId;  // project ID chosen from keyboard

    /**
     * Projects presented as keyboard buttons during /NewTask.
     * Key = display label shown to user, Value = project ID string.
     * LinkedHashMap preserves insertion order (matches keyboard order).
     */
    private Map<String, String> projectChoices = new LinkedHashMap<>();

    // ── Linked AppUser ────────────────────────────────────────────
    private Long appUserId;         // AppUser.id after successful /ConfigUser

    // ── Accessors ─────────────────────────────────────────────────

    public ConversationState getState()              { return state; }
    public void setState(ConversationState state)    { this.state = state; }

    public UserAction getAction()                    { return action; }
    public void setAction(UserAction action)         { this.action = action; }

    public String getTaskId()                        { return taskId; }
    public void setTaskId(String taskId)             { this.taskId = taskId; }

    public String getTempName()                      { return tempName; }
    public void setTempName(String tempName)         { this.tempName = tempName; }

    public Integer getTempExpected()                 { return tempExpected; }
    public void setTempExpected(Integer tempExpected){ this.tempExpected = tempExpected; }

    public String getTempProjectId()                 { return tempProjectId; }
    public void setTempProjectId(String tempProjectId){ this.tempProjectId = tempProjectId; }

    public Map<String, String> getProjectChoices()                       { return projectChoices; }
    public void setProjectChoices(Map<String, String> projectChoices)    { this.projectChoices = projectChoices; }

    public Long getAppUserId()                       { return appUserId; }
    public void setAppUserId(Long appUserId)         { this.appUserId = appUserId; }

    public boolean isLinked()                        { return appUserId != null; }

    /** Resets all transient conversation fields (keeps appUserId). */
    public void resetConversation() {
        state          = ConversationState.NONE;
        action         = UserAction.NONE;
        taskId         = null;
        tempName       = null;
        tempExpected   = null;
        tempProjectId  = null;
        projectChoices = new LinkedHashMap<>();
    }
}