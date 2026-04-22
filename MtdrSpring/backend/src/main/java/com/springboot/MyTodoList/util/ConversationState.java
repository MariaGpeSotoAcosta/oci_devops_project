package com.springboot.MyTodoList.util;

public enum ConversationState {
    // Waiting es para modificar
    WAITING_ID,
    WAITING_NAME,
    WAITING_STATUS,
    WAITING_WORKED,
    WAITING_EXPECTED,
    // Creating es para crear una nueva task
    CREATING_NAME,
    CREATING_EXPECTED,

    WAITING_JOIN_CODE,
    WAITING_EMAIL,
    
    NONE
}