package com.springboot.MyTodoList.util;

public class UserSession {
    
    private ConversationState state = ConversationState.NONE;
    private String taskId;
    private UserAction action = UserAction.NONE;
    private String tempName;
    private Integer tempExpected;
    
    public ConversationState getState() {
        return state;
    }

    public void setState(ConversationState state) {
        this.state = state;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public UserAction getAction() {
        return action;
    }

    public void setAction(UserAction action) {
        this.action = action;
    }

    public String getTempName() {
        return tempName;
    }

    public void setTempName(String tempName) {
        this.tempName = tempName;
    }

    public Integer getTempExpected() {
        return tempExpected;
    }

    public void setTempExpected(Integer tempExpected) {
        this.tempExpected = tempExpected;
    }
}