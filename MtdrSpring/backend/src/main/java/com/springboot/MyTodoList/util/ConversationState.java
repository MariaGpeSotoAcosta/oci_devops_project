package com.springboot.MyTodoList.util;

public enum ConversationState {

    // ── /ConfigUser flow ──────────────────────────────────────────
    CONFIG_WAITING_CODE,        // waiting for the user to paste their join code

    // ── /NewTask flow ─────────────────────────────────────────────
    CREATING_NAME,              // waiting for task title
    CREATING_SELECTING_PROJECT, // waiting for user to pick a project (keyboard)
    CREATING_EXPECTED,          // waiting for expected hours (story points)

    // ── Modify existing task flow ─────────────────────────────────
    WAITING_ID,                 // waiting for task ID
    WAITING_NAME,               // waiting for new name value
    WAITING_STATUS,             // waiting for new status (keyboard shown)
    WAITING_WORKED,             // waiting for new worked hours
    WAITING_EXPECTED,           // waiting for new expected hours

    NONE
}