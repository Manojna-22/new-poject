package com.hmi.alarm.dto;

import com.hmi.alarm.entity.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AlarmRequest {

    @NotBlank(message = "Alarm code is required")
    @Size(min = 2, max = 30)
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Code must be uppercase letters, digits, '_' or '-'")
    private String code;

    @NotBlank(message = "Message is required")
    @Size(min = 3, max = 500)
    private String message;

    @NotNull(message = "Severity is required")
    private Severity severity;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }
}
