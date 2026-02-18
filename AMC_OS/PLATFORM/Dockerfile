# syntax=docker/dockerfile:1

FROM python:3.11-slim AS builder
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml README.md ./
COPY amc ./amc
RUN pip install --upgrade pip && pip wheel --no-deps --wheel-dir /wheels .


FROM python:3.11-slim AS runtime
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN addgroup --system --gid 10001 amc && adduser --system --uid 10001 --ingroup amc amc

COPY --from=builder /wheels /wheels
RUN pip install /wheels/*.whl && rm -rf /wheels

COPY amc ./amc
COPY README.md ./README.md

USER amc
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health')"

CMD ["uvicorn", "amc.api.main:app", "--host", "0.0.0.0", "--port", "8080"]
