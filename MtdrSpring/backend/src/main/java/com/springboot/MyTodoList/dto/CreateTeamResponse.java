package com.springboot.MyTodoList.dto;

public class CreateTeamResponse {
    private TeamDTO team;
    private String joinCode;

    public CreateTeamResponse() {}

    public CreateTeamResponse(TeamDTO team, String joinCode) {
        this.team = team;
        this.joinCode = joinCode;
    }

    public TeamDTO getTeam() { return team; }
    public void setTeam(TeamDTO team) { this.team = team; }

    public String getJoinCode() { return joinCode; }
    public void setJoinCode(String joinCode) { this.joinCode = joinCode; }
}
