// src/components/HeroPromptImprover.tsx
"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

type Summary = {
  audience?: string;
  pages?: string[];
  style?: string;
  features?: string[];
  lang?: "ar" | "en";
  industry?: string;
};

type ModeUsed = "ai" | "standard";

type WarningCode =
  | "AI_NOT_CONFIGURED"
  | "AI_NO_CREDITS"
  | "AI_RATE_LIMIT"
  | "AI_BAD_KEY"
  | "AI_LIMIT_REACHED"
  | "AI_FAILED"
  | null;

function getWarningUI(code: WarningCode, fallbackMessage?: string | null) {
  if (!code && fallbackMessage) {
    return {
      severity: "info" as const,
      title: "Heads up",
      body: fallbackMessage,
      helper: null as string | null,
    };
  }

  switch (code) {
    case "AI_NO_CREDITS":
      return {
        severity: "info" as const,
        title: "AI is unavailable right now",
        body: "AI rewrite needs API credits. We used Standard instead — still build-ready.",
        helper: "To enable AI: add billing/credits on your OpenAI API project.",
      };
    case "AI_NOT_CONFIGURED":
      return {
        severity: "info" as const,
        title: "AI isn’t enabled",
        body: "No API key found on this deployment. We used Standard instead.",
        helper: "Add OPENAI_API_KEY in .env.local then restart the dev server.",
      };
    case "AI_RATE_LIMIT":
      return {
        severity: "info" as const,
        title: "AI is busy",
        body: "Too many requests right now. We used Standard while you wait.",
        helper: "Try again in a minute.",
      };
    case "AI_BAD_KEY":
      return {
        severity: "warning" as const,
        title: "AI key issue",
        body: "The API key looks invalid, so we used Standard instead.",
        helper: "Double-check OPENAI_API_KEY (no extra spaces) and that it has access.",
      };
    case "AI_LIMIT_REACHED":
      return {
        severity: "info" as const,
        title: "Daily AI limit reached",
        body: "You hit today’s AI limit for this demo. We used Standard instead.",
        helper: "Standard is deterministic and still gives a build-ready prompt.",
      };
    case "AI_FAILED":
      return {
        severity: "info" as const,
        title: "AI failed temporarily",
        body: "We used Standard instead — still build-ready.",
        helper: "Try again later.",
      };
    default:
      return fallbackMessage
        ? {
            severity: "info" as const,
            title: "Heads up",
            body: fallbackMessage,
            helper: null,
          }
        : null;
  }
}

export default function HeroPromptImprover() {
  const [idea, setIdea] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [useAI, setUseAI] = React.useState(false);

  const [warning, setWarning] = React.useState<string | null>(null);
  const [warningCode, setWarningCode] = React.useState<WarningCode>(null);

  const [aiRemaining, setAiRemaining] = React.useState<number | null>(null);

  // summary chips
  const [summary, setSummary] = React.useState<Summary | null>(null);

  // show backend mode actually used
  const [modeUsed, setModeUsed] = React.useState<ModeUsed | null>(null);

  const onImprove = async () => {
    setError(null);
    setWarning(null);
    setWarningCode(null);
    setAiRemaining(null);
    setSummary(null);
    setModeUsed(null);
    setCopied(false);

    const trimmed = idea.trim();
    if (trimmed.length < 10) {
      setError("Please write a bit more detail (at least 10 characters).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: trimmed,
          mode: useAI ? "ai" : "standard",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Something went wrong");
        return;
      }

      setResult(data.improved ?? null);

      // warning + code
      setWarning(typeof data.warning === "string" ? data.warning : null);
      setWarningCode((data.warningCode as WarningCode) ?? null);

      // ai remaining
      setAiRemaining(
        typeof data?.ai?.remaining === "number" ? data.ai.remaining : null
      );

      // summary chips
      setSummary(data.summary || null);

      // backend mode used
      setModeUsed(data.modeUsed === "ai" ? "ai" : "standard");
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const onReset = () => {
    setIdea("");
    setResult(null);
    setError(null);
    setWarning(null);
    setWarningCode(null);
    setAiRemaining(null);
    setSummary(null);
    setModeUsed(null);
    setCopied(false);
    setUseAI(false);
  };

  const langLabel =
    summary?.lang === "ar"
      ? "Arabic"
      : summary?.lang === "en"
      ? "English"
      : null;

  const industryLabel = summary?.industry
    ? summary.industry
        .split(/[_-]/g)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : null;

  const warningUI = getWarningUI(warningCode, warning);

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
          }}
        >
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip icon={<AutoAwesomeIcon />} label="Website Prompt Improver" />
            </Stack>

            <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              Turn your rough idea into a website-ready AI prompt
            </Typography>

            <Typography variant="body1" color="text.secondary">
              Write your idea in plain words. We’ll turn it into a clear,
              structured prompt you can paste into an AI website builder.
            </Typography>

            <TextField
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Example: I want a website for my online fitness coaching business"
              multiline
              minRows={4}
              fullWidth
            />

            <Stack spacing={0.5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                  />
                }
                label="Use AI (better rewrite)"
              />

              <Typography variant="caption" color="text.secondary">
                AI mode has a small daily limit and may be slower. If AI isn’t
                available, we’ll fall back to Standard automatically.
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {useAI && aiRemaining !== null && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`AI remaining today: ${aiRemaining}`}
                    sx={{ mt: 0.5 }}
                  />
                )}

                {modeUsed && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color={modeUsed === "ai" ? "success" : "default"}
                    label={`Mode used: ${modeUsed === "ai" ? "AI" : "Standard"}`}
                    sx={{ mt: 0.5 }}
                  />
                )}

                {langLabel && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Language: ${langLabel}`}
                    sx={{ mt: 0.5 }}
                  />
                )}

                {industryLabel && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Detected: ${industryLabel}`}
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Stack>
            </Stack>

            {error && <Alert severity="warning">{error}</Alert>}

            {warningUI && (
              <Alert severity={warningUI.severity}>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                  {warningUI.title}
                </Typography>
                <Typography variant="body2">{warningUI.body}</Typography>
                {warningUI.helper && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                    {warningUI.helper}
                  </Typography>
                )}
              </Alert>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                size="large"
                onClick={onImprove}
                disabled={loading}
              >
                {loading ? "Improving..." : "Improve my idea"}
              </Button>

              <Button variant="outlined" size="large" onClick={onReset}>
                Reset
              </Button>
            </Stack>

            {result && (
              <>
                <Divider sx={{ my: 1 }} />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Your improved website prompt
                  </Typography>

                  <Tooltip title={copied ? "Copied!" : "Copy"}>
                    <IconButton onClick={onCopy}>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {copied && <Alert severity="success">Copied to clipboard</Alert>}

                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2, md: 3 },
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    whiteSpace: "pre-wrap",
                    fontSize: 15,
                    lineHeight: 1.8,
                  }}
                >
                  <Typography
                    component="div"
                    sx={{
                      whiteSpace: "pre-wrap",
                      fontSize: 15,
                      lineHeight: 1.8,
                    }}
                  >
                    {result}
                  </Typography>
                </Paper>
              </>
            )}
          </Stack>
        </Paper>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2, textAlign: "center" }}
        >
          Tip: describe the business, audience, and what pages you need.
        </Typography>
      </Container>
    </Box>
  );
}
