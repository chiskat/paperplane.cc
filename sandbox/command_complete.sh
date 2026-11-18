if [[ -n "${BASH_VERSION:-}" ]] && [[ "$-" == *i* ]]; then
  __command_complete() {
    local exit_code=$?

    if [[ -n "${__command_complete_sign:-}" ]]; then
      printf '\033]133;D;%s\007' "$exit_code"
    fi

    __command_complete_sign=1
  }

  if [[ ";${PROMPT_COMMAND:-};" != *";__command_complete;"* ]]; then
    PROMPT_COMMAND="__command_complete${PROMPT_COMMAND:+;$PROMPT_COMMAND}"
  fi
fi
