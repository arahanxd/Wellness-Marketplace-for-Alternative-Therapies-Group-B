package com.wellness.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AiResponse {

    @JsonProperty("remedies")
    public String remedies;

    @JsonProperty("therapy")
    public String therapy;

    @JsonProperty("lifestyle")
    public String lifestyle;

    @JsonProperty("medicine")
    public String medicine;

    @JsonProperty("warning")
    public String warning;
}