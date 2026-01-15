# DAI Smart Room

![License](https://img.shields.io/badge/license-MIT-green)
![Open Source](https://img.shields.io/badge/open--source-100%25-blue)
![Language](https://img.shields.io/badge/language-TypeScript-orange)

**Distributed Artificial Intelligence – Experimental Project**

DAI Smart Room is a **distributed multi-agent system** that simulates the intelligent management of a smart indoor environment. The project is conceived as an **experimental, software-only platform** to demonstrate the principles, architectures, and trade-offs of **Distributed Artificial Intelligence (DAI)**, with a strong emphasis on **agent autonomy, coordination, scalability, and observability**.

This repository is designed to serve both as:

* an **academic project** eligible for the *Distributed Artificial Intelligence* exam, and
* a **portfolio-grade, enterprise-style system** suitable for extension toward real-world IoT deployments.

## Table of Contents

* [Project Goals](#project-goals)
* [Why This Project Is Suitable for a DAI Exam](#why-this-project-is-suitable-for-a-dai-exam)
* [System Overview](#system-overview)
* [Agent-Based Architecture](#agent-based-architecture)

  * [Core Agents](#core-agents)
* [Communication Model](#communication-model)
* [Execution Model](#execution-model)
* [Observability & Evaluation](#observability--evaluation)
* [Technologies Used](#technologies-used)
* [Extensibility](#extensibility)
* [Documentation](#documentation)
* [Conclusion](#conclusion)
* [Author](#author)

## Project Goals

The main objectives of DAI Smart Room are:

* Model a **realistic distributed system** composed of multiple autonomous agents
* Maintain **ambient comfort** (temperature, air quality, lighting)
* **Optimize energy consumption** through coordination and adaptive strategies
* Demonstrate **distributed decision-making**, avoiding centralized control
* Provide **quantitative metrics** to evaluate system behavior

The project intentionally balances **theoretical correctness** (DAI concepts) with **engineering realism** (modern tooling, messaging, observability).

## Why This Project Is Suitable for a DAI Exam

DAI Smart Room directly addresses the core topics of Distributed Artificial Intelligence:

* **Multiple autonomous agents** with clearly defined responsibilities
* **Asynchronous communication** via message passing
* **Partial knowledge** and local perception at agent level
* **Scalability and fault tolerance** considerations

Rather than focusing on a single AI algorithm, the system emphasizes **system-level intelligence emerging from agent interactions**, which is a central theme of DAI.

## System Overview

The system simulates an **entire house composed of multiple rooms**, each managed by cooperating agents.
While execution is local, the architecture is designed to preserve the **semantics of a distributed system**, enabling future scaling across rooms, buildings, or hosts.

## Agent-Based Architecture

Each agent is modeled as an independent software entity with:

* a well-defined responsibility
* its own communication topics (publish / subscribe)
* no shared memory with other agents

### Core Agents

* **Room Agent**
  Manages local comfort within a room by processing sensor data and controlling actuators, while respecting global policies.

* **Orchestrator Agent**
  Enforces global constraints (e.g. energy efficiency vs comfort), resolves conflicts among rooms, and coordinates system-wide behavior.

This separation ensures **loose coupling**, **clear responsibilities**, and **true distribution of intelligence**.

## Communication Model

Agents communicate exclusively through a **publish/subscribe model** over an MQTT broker:

* Asynchronous
* Decoupled in time and space
* Event-driven

## Execution Model

* Single-host execution
* Independent agents with no shared state
* All coordination performed via message passing

## Observability & Evaluation

A core design principle of the project is **measurability**, not just functionality.

The system provides:

* **Real-time dashboards** for metrics and system status
* **Structured logs** and event streams
* **Key Performance Indicators (KPIs)**, including:

  * decision latency
  * message throughput
  * comfort stability
  * fault tolerance

These metrics enable **objective evaluation** of architectural and coordination choices during the exam.

## Technologies Used

| Technology       | Purpose                         |
| ---------------- | ------------------------------- |
| TypeScript + Bun | Agent logic and runtime         |
| MQTT (Mosquitto) | Inter-agent communication       |
| Prometheus       | Metrics collection              |
| Grafana          | Dashboards for metrics and logs |
| Docker           | Reproducible local environment  |

All tools and libraries used are **open-source** and suitable for both academic and professional contexts.

## Extensibility

The architecture is intentionally designed for extension:

* Integration with real hardware (ESP32, physical sensors)
* Advanced learning and adaptive agents
* Alternative coordination and optimization strategies

This makes the project suitable not only for the exam, but also for continued academic exploration or professional development.

## Documentation

The repository includes:

* This README (high-level overview)
* Presentation slides for oral discussion

## Conclusion

DAI Smart Room is not a toy example or a single-algorithm demo.

It is a **complete distributed intelligence system**, designed to:

* reflect real-world distributed constraints
* demonstrate core DAI principles
* support quantitative evaluation
* justify architectural and design decisions

## Author

* **Nicola Guerra**
