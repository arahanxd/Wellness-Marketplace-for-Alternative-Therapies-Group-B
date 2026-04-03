package com.wellness.backend.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class AiRequest {

    @JsonProperty("symptoms")
    public List<Symptom> symptoms;

    @JsonProperty("duration")
    public String duration;

    public static class Symptom {

        @JsonProperty("name")
        public String name;

        @JsonProperty("severity")
        public String severity;
    }
}