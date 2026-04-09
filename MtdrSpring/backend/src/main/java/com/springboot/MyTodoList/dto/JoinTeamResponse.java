package com.springboot.MyTodoList.dto;

public class JoinTeamResponse {
    private TeamDTO team;
    private Boolean success;

    public JoinTeamResponse() {}

    public JoinTeamResponse(TeamDTO team, Boolean success) {
        this.team = team;
        this.success = success;
    }

    public TeamDTO getTeam() { return team; }
    public void setTeam(TeamDTO team) { this.team = team; }

    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }
}
