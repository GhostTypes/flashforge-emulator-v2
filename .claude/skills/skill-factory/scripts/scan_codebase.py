#!/usr/bin/env python3
"""
Codebase Scanner - Analyzes a codebase to identify languages, frameworks, and libraries.
Outputs suggestions for skills to create and documentation sources to scrape.

Usage: scan_codebase.py [directory] [options]
"""

import sys
import os
import json
import re
from pathlib import Path
from collections import Counter, defaultdict
from typing import Dict, List, Set, Tuple, Optional, Any
import argparse

# Try to import pathspec for gitignore support, fall back to basic filtering
try:
    import pathspec
    HAS_PATHSPEC = True
except ImportError:
    HAS_PATHSPEC = False

# =============================================================================
# TECH SIGNATURES DATABASE
# =============================================================================

TECH_SIGNATURES = {
    # JavaScript/TypeScript Frameworks
    "next.js": {
        "files": ["next.config.js", "next.config.mjs", "next.config.ts"],
        "deps": ["next"],
        "priority": "HIGH",
        "doc_url": "https://nextjs.org/docs",
        "source_type": "website",
        "category": "framework"
    },
    "react": {
        "deps": ["react", "react-dom"],
        "priority": "HIGH",
        "doc_url": "https://react.dev/learn",
        "source_type": "website",
        "category": "framework"
    },
    "vue": {
        "files": ["vue.config.js", "vite.config.ts"],
        "deps": ["vue"],
        "priority": "HIGH",
        "doc_url": "https://vuejs.org/guide",
        "source_type": "website",
        "category": "framework"
    },
    "angular": {
        "files": ["angular.json"],
        "deps": ["@angular/core"],
        "priority": "HIGH",
        "doc_url": "https://angular.io/docs",
        "source_type": "website",
        "category": "framework"
    },
    "svelte": {
        "files": ["svelte.config.js"],
        "deps": ["svelte"],
        "priority": "HIGH",
        "doc_url": "https://svelte.dev/docs",
        "source_type": "website",
        "category": "framework"
    },
    "nuxt": {
        "files": ["nuxt.config.js", "nuxt.config.ts"],
        "deps": ["nuxt"],
        "priority": "HIGH",
        "doc_url": "https://nuxt.com/docs",
        "source_type": "website",
        "category": "framework"
    },
    "remix": {
        "files": ["remix.config.js"],
        "deps": ["@remix-run/react"],
        "priority": "HIGH",
        "doc_url": "https://remix.run/docs",
        "source_type": "website",
        "category": "framework"
    },
    "astro": {
        "files": ["astro.config.mjs", "astro.config.ts"],
        "deps": ["astro"],
        "priority": "HIGH",
        "doc_url": "https://docs.astro.build",
        "source_type": "website",
        "category": "framework"
    },
    "gatsby": {
        "files": ["gatsby-config.js", "gatsby-config.ts"],
        "deps": ["gatsby"],
        "priority": "MEDIUM",
        "doc_url": "https://www.gatsbyjs.com/docs",
        "source_type": "website",
        "category": "framework"
    },
    "solid": {
        "deps": ["solid-js"],
        "priority": "MEDIUM",
        "doc_url": "https://www.solidjs.com/docs",
        "source_type": "website",
        "category": "framework"
    },
    "qwik": {
        "deps": ["@builder.io/qwik"],
        "priority": "MEDIUM",
        "doc_url": "https://qwik.dev/docs",
        "source_type": "website",
        "category": "framework"
    },
    
    # Build Tools
    "vite": {
        "files": ["vite.config.js", "vite.config.ts", "vite.config.mjs"],
        "deps": ["vite"],
        "priority": "HIGH",
        "doc_url": "https://vite.dev/guide",
        "source_type": "website",
        "category": "build"
    },
    "webpack": {
        "files": ["webpack.config.js", "webpack.config.ts"],
        "deps": ["webpack"],
        "priority": "MEDIUM",
        "doc_url": "https://webpack.js.org/concepts",
        "source_type": "website",
        "category": "build"
    },
    "esbuild": {
        "deps": ["esbuild"],
        "priority": "MEDIUM",
        "doc_url": "https://esbuild.github.io",
        "source_type": "website",
        "category": "build"
    },
    "rollup": {
        "files": ["rollup.config.js", "rollup.config.mjs"],
        "deps": ["rollup"],
        "priority": "LOW",
        "doc_url": "https://rollupjs.org/guide",
        "source_type": "website",
        "category": "build"
    },
    "turbopack": {
        "deps": ["turbo"],
        "priority": "MEDIUM",
        "doc_url": "https://turbo.build/pack/docs",
        "source_type": "website",
        "category": "build"
    },
    "turborepo": {
        "files": ["turbo.json"],
        "deps": ["turbo"],
        "priority": "MEDIUM",
        "doc_url": "https://turbo.build/repo/docs",
        "source_type": "website",
        "category": "build"
    },
    
    # Node.js / Backend JS
    "express": {
        "deps": ["express"],
        "priority": "MEDIUM",
        "doc_url": "https://expressjs.com/en/guide",
        "source_type": "website",
        "category": "backend"
    },
    "fastify": {
        "deps": ["fastify"],
        "priority": "MEDIUM",
        "doc_url": "https://fastify.dev/docs",
        "source_type": "website",
        "category": "backend"
    },
    "nestjs": {
        "deps": ["@nestjs/core"],
        "priority": "HIGH",
        "doc_url": "https://docs.nestjs.com",
        "source_type": "website",
        "category": "backend"
    },
    "hono": {
        "deps": ["hono"],
        "priority": "MEDIUM",
        "doc_url": "https://hono.dev/docs",
        "source_type": "website",
        "category": "backend"
    },
    
    # Database / ORM
    "prisma": {
        "files": ["prisma/schema.prisma"],
        "deps": ["@prisma/client", "prisma"],
        "priority": "HIGH",
        "doc_url": "https://www.prisma.io/docs",
        "source_type": "website",
        "category": "database"
    },
    "drizzle": {
        "files": ["drizzle.config.ts"],
        "deps": ["drizzle-orm"],
        "priority": "MEDIUM",
        "doc_url": "https://orm.drizzle.team/docs",
        "source_type": "website",
        "category": "database"
    },
    "typeorm": {
        "deps": ["typeorm"],
        "priority": "MEDIUM",
        "doc_url": "https://typeorm.io",
        "source_type": "website",
        "category": "database"
    },
    "sequelize": {
        "deps": ["sequelize"],
        "priority": "MEDIUM",
        "doc_url": "https://sequelize.org/docs/v6",
        "source_type": "website",
        "category": "database"
    },
    "mongoose": {
        "deps": ["mongoose"],
        "priority": "MEDIUM",
        "doc_url": "https://mongoosejs.com/docs",
        "source_type": "website",
        "category": "database"
    },
    
    # Python Frameworks
    "fastapi": {
        "deps": ["fastapi"],
        "priority": "HIGH",
        "doc_url": "https://fastapi.tiangolo.com",
        "source_type": "website",
        "category": "backend"
    },
    "django": {
        "files": ["manage.py"],
        "deps": ["django"],
        "priority": "HIGH",
        "doc_url": "https://docs.djangoproject.com",
        "source_type": "website",
        "category": "backend"
    },
    "flask": {
        "deps": ["flask"],
        "priority": "MEDIUM",
        "doc_url": "https://flask.palletsprojects.com",
        "source_type": "website",
        "category": "backend"
    },
    "starlette": {
        "deps": ["starlette"],
        "priority": "MEDIUM",
        "doc_url": "https://www.starlette.io",
        "source_type": "website",
        "category": "backend"
    },
    "pydantic": {
        "deps": ["pydantic"],
        "priority": "MEDIUM",
        "doc_url": "https://docs.pydantic.dev",
        "source_type": "website",
        "category": "library"
    },
    "sqlalchemy": {
        "deps": ["sqlalchemy"],
        "priority": "MEDIUM",
        "doc_url": "https://docs.sqlalchemy.org",
        "source_type": "website",
        "category": "database"
    },
    "celery": {
        "deps": ["celery"],
        "priority": "MEDIUM",
        "doc_url": "https://docs.celeryq.dev",
        "source_type": "website",
        "category": "library"
    },
    "pytest": {
        "files": ["pytest.ini", "pyproject.toml"],
        "deps": ["pytest"],
        "priority": "LOW",
        "doc_url": "https://docs.pytest.org",
        "source_type": "website",
        "category": "testing"
    },
    
    # Rust
    "tokio": {
        "deps": ["tokio"],
        "priority": "HIGH",
        "doc_url": "https://tokio.rs/tokio/tutorial",
        "source_type": "website",
        "category": "runtime"
    },
    "actix-web": {
        "deps": ["actix-web"],
        "priority": "MEDIUM",
        "doc_url": "https://actix.rs/docs",
        "source_type": "website",
        "category": "backend"
    },
    "axum": {
        "deps": ["axum"],
        "priority": "MEDIUM",
        "doc_url": "https://docs.rs/axum",
        "source_type": "website",
        "category": "backend"
    },
    "serde": {
        "deps": ["serde"],
        "priority": "MEDIUM",
        "doc_url": "https://serde.rs",
        "source_type": "website",
        "category": "library"
    },
    "bevy": {
        "deps": ["bevy"],
        "priority": "HIGH",
        "doc_url": "https://bevyengine.org/learn",
        "source_type": "website",
        "category": "game-engine"
    },
    "tauri": {
        "files": ["tauri.conf.json", "src-tauri/tauri.conf.json"],
        "deps": ["tauri"],
        "priority": "HIGH",
        "doc_url": "https://tauri.app/v1/guides",
        "source_type": "website",
        "category": "framework"
    },
    
    # Go
    "gin": {
        "deps": ["github.com/gin-gonic/gin"],
        "priority": "MEDIUM",
        "doc_url": "https://gin-gonic.com/docs",
        "source_type": "website",
        "category": "backend"
    },
    "echo": {
        "deps": ["github.com/labstack/echo"],
        "priority": "MEDIUM",
        "doc_url": "https://echo.labstack.com/docs",
        "source_type": "website",
        "category": "backend"
    },
    "fiber": {
        "deps": ["github.com/gofiber/fiber"],
        "priority": "MEDIUM",
        "doc_url": "https://docs.gofiber.io",
        "source_type": "website",
        "category": "backend"
    },
    
    # Java/Kotlin
    "spring-boot": {
        "files": ["build.gradle", "pom.xml"],
        "deps": ["org.springframework.boot"],
        "priority": "HIGH",
        "doc_url": "https://docs.spring.io/spring-boot/docs/current/reference/html",
        "source_type": "website",
        "category": "backend"
    },
    "ktor": {
        "deps": ["io.ktor"],
        "priority": "MEDIUM",
        "doc_url": "https://ktor.io/docs",
        "source_type": "website",
        "category": "backend"
    },
    
    # .NET
    "aspnet": {
        "files": ["*.csproj"],
        "deps": ["Microsoft.AspNetCore"],
        "priority": "HIGH",
        "doc_url": "https://learn.microsoft.com/aspnet/core",
        "source_type": "website",
        "category": "backend"
    },
    "blazor": {
        "deps": ["Microsoft.AspNetCore.Components"],
        "priority": "MEDIUM",
        "doc_url": "https://learn.microsoft.com/aspnet/core/blazor",
        "source_type": "website",
        "category": "frontend"
    },
    
    # Mobile
    "react-native": {
        "deps": ["react-native"],
        "priority": "HIGH",
        "doc_url": "https://reactnative.dev/docs",
        "source_type": "website",
        "category": "mobile"
    },
    "expo": {
        "files": ["app.json", "app.config.js"],
        "deps": ["expo"],
        "priority": "HIGH",
        "doc_url": "https://docs.expo.dev",
        "source_type": "website",
        "category": "mobile"
    },
    "flutter": {
        "files": ["pubspec.yaml"],
        "deps": ["flutter"],
        "priority": "HIGH",
        "doc_url": "https://docs.flutter.dev",
        "source_type": "website",
        "category": "mobile"
    },
    
    # Testing
    "jest": {
        "files": ["jest.config.js", "jest.config.ts"],
        "deps": ["jest"],
        "priority": "LOW",
        "doc_url": "https://jestjs.io/docs",
        "source_type": "website",
        "category": "testing"
    },
    "vitest": {
        "files": ["vitest.config.ts"],
        "deps": ["vitest"],
        "priority": "LOW",
        "doc_url": "https://vitest.dev/guide",
        "source_type": "website",
        "category": "testing"
    },
    "playwright": {
        "files": ["playwright.config.ts"],
        "deps": ["@playwright/test", "playwright"],
        "priority": "MEDIUM",
        "doc_url": "https://playwright.dev/docs",
        "source_type": "website",
        "category": "testing"
    },
    "cypress": {
        "files": ["cypress.config.js", "cypress.config.ts"],
        "deps": ["cypress"],
        "priority": "MEDIUM",
        "doc_url": "https://docs.cypress.io",
        "source_type": "website",
        "category": "testing"
    },
    
    # State Management
    "redux": {
        "deps": ["redux", "@reduxjs/toolkit"],
        "priority": "MEDIUM",
        "doc_url": "https://redux.js.org/introduction",
        "source_type": "website",
        "category": "state"
    },
    "zustand": {
        "deps": ["zustand"],
        "priority": "MEDIUM",
        "doc_url": "https://github.com/pmndrs/zustand",
        "source_type": "repo",
        "category": "state"
    },
    "jotai": {
        "deps": ["jotai"],
        "priority": "MEDIUM",
        "doc_url": "https://jotai.org/docs",
        "source_type": "website",
        "category": "state"
    },
    "mobx": {
        "deps": ["mobx"],
        "priority": "MEDIUM",
        "doc_url": "https://mobx.js.org/README.html",
        "source_type": "website",
        "category": "state"
    },
    "tanstack-query": {
        "deps": ["@tanstack/react-query", "react-query"],
        "priority": "MEDIUM",
        "doc_url": "https://tanstack.com/query/latest/docs",
        "source_type": "website",
        "category": "state"
    },
    
    # UI Libraries
    "tailwindcss": {
        "files": ["tailwind.config.js", "tailwind.config.ts"],
        "deps": ["tailwindcss"],
        "priority": "MEDIUM",
        "doc_url": "https://tailwindcss.com/docs",
        "source_type": "website",
        "category": "styling"
    },
    "shadcn-ui": {
        "files": ["components.json"],
        "priority": "MEDIUM",
        "doc_url": "https://ui.shadcn.com/docs",
        "source_type": "website",
        "category": "ui"
    },
    "radix-ui": {
        "deps": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
        "priority": "MEDIUM",
        "doc_url": "https://www.radix-ui.com/docs",
        "source_type": "website",
        "category": "ui"
    },
    "chakra-ui": {
        "deps": ["@chakra-ui/react"],
        "priority": "MEDIUM",
        "doc_url": "https://chakra-ui.com/docs",
        "source_type": "website",
        "category": "ui"
    },
    "material-ui": {
        "deps": ["@mui/material"],
        "priority": "MEDIUM",
        "doc_url": "https://mui.com/material-ui/getting-started",
        "source_type": "website",
        "category": "ui"
    },
    "ant-design": {
        "deps": ["antd"],
        "priority": "MEDIUM",
        "doc_url": "https://ant.design/docs/react/introduce",
        "source_type": "website",
        "category": "ui"
    },
    
    # 3D / Graphics
    "three.js": {
        "deps": ["three"],
        "priority": "MEDIUM",
        "doc_url": "https://threejs.org/docs",
        "source_type": "website",
        "category": "graphics"
    },
    "react-three-fiber": {
        "deps": ["@react-three/fiber"],
        "priority": "MEDIUM",
        "doc_url": "https://docs.pmnd.rs/react-three-fiber",
        "source_type": "website",
        "category": "graphics"
    },
    
    # Auth
    "next-auth": {
        "deps": ["next-auth"],
        "priority": "MEDIUM",
        "doc_url": "https://next-auth.js.org/getting-started",
        "source_type": "website",
        "category": "auth"
    },
    "clerk": {
        "deps": ["@clerk/nextjs", "@clerk/clerk-react"],
        "priority": "MEDIUM",
        "doc_url": "https://clerk.com/docs",
        "source_type": "website",
        "category": "auth"
    },
    "lucia": {
        "deps": ["lucia"],
        "priority": "MEDIUM",
        "doc_url": "https://lucia-auth.com/getting-started",
        "source_type": "website",
        "category": "auth"
    },
    
    # Misc Tools
    "docker": {
        "files": ["Dockerfile", "docker-compose.yml", "docker-compose.yaml"],
        "priority": "MEDIUM",
        "doc_url": "https://docs.docker.com",
        "source_type": "website",
        "category": "devops"
    },
    "kubernetes": {
        "files": ["k8s/", "kubernetes/", "*.yaml"],
        "priority": "MEDIUM",
        "doc_url": "https://kubernetes.io/docs",
        "source_type": "website",
        "category": "devops"
    },
    "terraform": {
        "files": ["*.tf", "main.tf"],
        "priority": "MEDIUM",
        "doc_url": "https://developer.hashicorp.com/terraform/docs",
        "source_type": "website",
        "category": "devops"
    },
    "github-actions": {
        "files": [".github/workflows/"],
        "priority": "LOW",
        "doc_url": "https://docs.github.com/actions",
        "source_type": "website",
        "category": "devops"
    },
    
    # AI/ML
    "langchain": {
        "deps": ["langchain"],
        "priority": "HIGH",
        "doc_url": "https://python.langchain.com/docs",
        "source_type": "website",
        "category": "ai"
    },
    "openai": {
        "deps": ["openai"],
        "priority": "MEDIUM",
        "doc_url": "https://platform.openai.com/docs",
        "source_type": "website",
        "category": "ai"
    },
    "huggingface": {
        "deps": ["transformers", "huggingface_hub"],
        "priority": "MEDIUM",
        "doc_url": "https://huggingface.co/docs",
        "source_type": "website",
        "category": "ai"
    },
    "pytorch": {
        "deps": ["torch"],
        "priority": "MEDIUM",
        "doc_url": "https://pytorch.org/docs",
        "source_type": "website",
        "category": "ai"
    },
    "tensorflow": {
        "deps": ["tensorflow"],
        "priority": "MEDIUM",
        "doc_url": "https://www.tensorflow.org/guide",
        "source_type": "website",
        "category": "ai"
    },
    
    # Electron / Desktop
    "electron": {
        "files": ["electron.vite.config.ts", "electron-builder.yml"],
        "deps": ["electron"],
        "priority": "HIGH",
        "doc_url": "https://www.electronjs.org/docs",
        "source_type": "website",
        "category": "desktop"
    },
    
    # Monorepo
    "lerna": {
        "files": ["lerna.json"],
        "deps": ["lerna"],
        "priority": "LOW",
        "doc_url": "https://lerna.js.org/docs",
        "source_type": "website",
        "category": "tooling"
    },
    "nx": {
        "files": ["nx.json"],
        "deps": ["nx"],
        "priority": "MEDIUM",
        "doc_url": "https://nx.dev/getting-started/intro",
        "source_type": "website",
        "category": "tooling"
    },
    "pnpm-workspace": {
        "files": ["pnpm-workspace.yaml"],
        "priority": "LOW",
        "doc_url": "https://pnpm.io/workspaces",
        "source_type": "website",
        "category": "tooling"
    },
}

# =============================================================================
# LANGUAGE DETECTION
# =============================================================================

LANGUAGE_EXTENSIONS = {
    ".py": "Python",
    ".pyw": "Python",
    ".pyi": "Python",
    ".js": "JavaScript",
    ".mjs": "JavaScript",
    ".cjs": "JavaScript",
    ".jsx": "JavaScript (JSX)",
    ".ts": "TypeScript",
    ".tsx": "TypeScript (TSX)",
    ".mts": "TypeScript",
    ".cts": "TypeScript",
    ".rs": "Rust",
    ".go": "Go",
    ".java": "Java",
    ".kt": "Kotlin",
    ".kts": "Kotlin",
    ".scala": "Scala",
    ".cs": "C#",
    ".fs": "F#",
    ".vb": "Visual Basic",
    ".c": "C",
    ".h": "C/C++ Header",
    ".cpp": "C++",
    ".cc": "C++",
    ".cxx": "C++",
    ".hpp": "C++ Header",
    ".rb": "Ruby",
    ".php": "PHP",
    ".swift": "Swift",
    ".m": "Objective-C",
    ".mm": "Objective-C++",
    ".dart": "Dart",
    ".lua": "Lua",
    ".pl": "Perl",
    ".pm": "Perl",
    ".r": "R",
    ".R": "R",
    ".jl": "Julia",
    ".ex": "Elixir",
    ".exs": "Elixir",
    ".erl": "Erlang",
    ".hrl": "Erlang",
    ".hs": "Haskell",
    ".lhs": "Haskell",
    ".ml": "OCaml",
    ".mli": "OCaml",
    ".clj": "Clojure",
    ".cljs": "ClojureScript",
    ".elm": "Elm",
    ".nim": "Nim",
    ".zig": "Zig",
    ".v": "V",
    ".vue": "Vue",
    ".svelte": "Svelte",
    ".astro": "Astro",
    ".sol": "Solidity",
    ".move": "Move",
    ".sh": "Shell",
    ".bash": "Bash",
    ".zsh": "Zsh",
    ".fish": "Fish",
    ".ps1": "PowerShell",
    ".psm1": "PowerShell",
    ".bat": "Batch",
    ".cmd": "Batch",
    ".sql": "SQL",
    ".graphql": "GraphQL",
    ".gql": "GraphQL",
    ".proto": "Protocol Buffers",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".json": "JSON",
    ".toml": "TOML",
    ".xml": "XML",
    ".html": "HTML",
    ".htm": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".sass": "Sass",
    ".less": "Less",
    ".md": "Markdown",
    ".mdx": "MDX",
    ".rst": "reStructuredText",
    ".tex": "LaTeX",
    ".tf": "Terraform",
    ".hcl": "HCL",
    ".dockerfile": "Dockerfile",
    ".prisma": "Prisma",
}

# =============================================================================
# PACKAGE FILE PARSERS
# =============================================================================

def parse_package_json(content: str) -> Set[str]:
    """Extract dependencies from package.json"""
    deps = set()
    try:
        data = json.loads(content)
        for key in ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]:
            if key in data and isinstance(data[key], dict):
                deps.update(data[key].keys())
    except json.JSONDecodeError:
        pass
    return deps

def parse_requirements_txt(content: str) -> Set[str]:
    """Extract dependencies from requirements.txt"""
    deps = set()
    for line in content.splitlines():
        line = line.strip()
        if line and not line.startswith("#") and not line.startswith("-"):
            # Extract package name (before ==, >=, <=, ~=, etc.)
            match = re.match(r'^([a-zA-Z0-9_-]+)', line)
            if match:
                deps.add(match.group(1).lower())
    return deps

def parse_pyproject_toml(content: str) -> Set[str]:
    """Extract dependencies from pyproject.toml"""
    deps = set()
    # Simple regex-based parsing (avoid toml dependency)
    in_deps = False
    for line in content.splitlines():
        if re.match(r'\[(project\.)?dependencies\]', line) or re.match(r'\[tool\.poetry\.dependencies\]', line):
            in_deps = True
            continue
        if in_deps:
            if line.startswith("["):
                in_deps = False
                continue
            match = re.match(r'^([a-zA-Z0-9_-]+)\s*[=<>~!]', line)
            if match:
                deps.add(match.group(1).lower())
            # Poetry style: name = "^version"
            match = re.match(r'^([a-zA-Z0-9_-]+)\s*=', line)
            if match:
                deps.add(match.group(1).lower())
    return deps

def parse_cargo_toml(content: str) -> Set[str]:
    """Extract dependencies from Cargo.toml"""
    deps = set()
    in_deps = False
    for line in content.splitlines():
        if "[dependencies]" in line or "[dev-dependencies]" in line or "[build-dependencies]" in line:
            in_deps = True
            continue
        if in_deps:
            if line.startswith("["):
                in_deps = False
                continue
            match = re.match(r'^([a-zA-Z0-9_-]+)\s*=', line)
            if match:
                deps.add(match.group(1))
    return deps

def parse_go_mod(content: str) -> Set[str]:
    """Extract dependencies from go.mod"""
    deps = set()
    in_require = False
    for line in content.splitlines():
        line = line.strip()
        if line == "require (":
            in_require = True
            continue
        if in_require:
            if line == ")":
                in_require = False
                continue
            parts = line.split()
            if parts:
                deps.add(parts[0])
        elif line.startswith("require "):
            parts = line[8:].split()
            if parts:
                deps.add(parts[0])
    return deps

def parse_composer_json(content: str) -> Set[str]:
    """Extract dependencies from composer.json"""
    deps = set()
    try:
        data = json.loads(content)
        for key in ["require", "require-dev"]:
            if key in data and isinstance(data[key], dict):
                deps.update(data[key].keys())
    except json.JSONDecodeError:
        pass
    return deps

def parse_gemfile(content: str) -> Set[str]:
    """Extract dependencies from Gemfile"""
    deps = set()
    for line in content.splitlines():
        line = line.strip()
        match = re.match(r"gem\s+['\"]([^'\"]+)['\"]", line)
        if match:
            deps.add(match.group(1))
    return deps

def parse_pubspec_yaml(content: str) -> Set[str]:
    """Extract dependencies from pubspec.yaml"""
    deps = set()
    in_deps = False
    for line in content.splitlines():
        if line.strip() in ["dependencies:", "dev_dependencies:"]:
            in_deps = True
            continue
        if in_deps:
            if not line.startswith(" ") and not line.startswith("\t"):
                in_deps = False
                continue
            match = re.match(r'\s+([a-zA-Z0-9_]+):', line)
            if match:
                deps.add(match.group(1))
    return deps

PACKAGE_PARSERS = {
    "package.json": parse_package_json,
    "requirements.txt": parse_requirements_txt,
    "pyproject.toml": parse_pyproject_toml,
    "Cargo.toml": parse_cargo_toml,
    "go.mod": parse_go_mod,
    "composer.json": parse_composer_json,
    "Gemfile": parse_gemfile,
    "pubspec.yaml": parse_pubspec_yaml,
}

# =============================================================================
# SCANNER
# =============================================================================

class CodebaseScanner:
    def __init__(self, root_dir: str, exclude_patterns: List[str] = None):
        self.root = Path(root_dir).resolve()
        self.exclude_patterns = exclude_patterns or ["node_modules", ".git", "dist", "build", "__pycache__", ".next", "venv", ".venv", "target"]
        self.gitignore_spec = self._load_gitignore()
        
        # Results
        self.file_counts: Counter = Counter()
        self.language_counts: Counter = Counter()
        self.dependencies: Set[str] = set()
        self.detected_files: Set[str] = set()
        self.detected_tech: Dict[str, Dict] = {}
        self.existing_skills: List[str] = []
        
    def _load_gitignore(self) -> Optional[Any]:
        """Load .gitignore patterns if pathspec is available"""
        if not HAS_PATHSPEC:
            return None
        gitignore_path = self.root / ".gitignore"
        if gitignore_path.exists():
            with open(gitignore_path, "r", encoding="utf-8", errors="ignore") as f:
                return pathspec.PathSpec.from_lines("gitwildmatch", f)
        return None
    
    def _should_ignore(self, path: Path) -> bool:
        """Check if path should be ignored"""
        rel_path = str(path.relative_to(self.root))
        
        # Check exclude patterns
        for pattern in self.exclude_patterns:
            if pattern in rel_path:
                return True
        
        # Check gitignore
        if self.gitignore_spec and self.gitignore_spec.match_file(rel_path):
            return True
        
        return False
    
    def scan(self):
        """Scan the codebase using os.walk for early directory pruning"""
        import os
        
        # Check for existing skills
        skills_dir = self.root / ".claude" / "skills"
        if skills_dir.exists():
            try:
                for item in skills_dir.iterdir():
                    if item.is_dir() and (item / "SKILL.md").exists():
                        self.existing_skills.append(item.name)
            except OSError:
                pass
        
        # Use os.walk for efficient directory traversal with pruning
        root_str = str(self.root)
        
        for dirpath, dirnames, filenames in os.walk(root_str, topdown=True):
            # Early pruning: modify dirnames in-place to skip excluded directories
            # This prevents os.walk from descending into them at all
            dirnames[:] = [d for d in dirnames if d not in self.exclude_patterns 
                          and not any(p in d for p in self.exclude_patterns)]
            
            for filename in filenames:
                try:
                    filepath = os.path.join(dirpath, filename)
                    rel_path = os.path.relpath(filepath, root_str)
                    
                    # Quick extension check
                    ext = os.path.splitext(filename)[1].lower()
                    
                    # Count files
                    self.file_counts[ext] += 1
                    
                    # Track detected files for tech signatures
                    self.detected_files.add(filename)
                    self.detected_files.add(rel_path.replace(os.sep, '/'))
                    
                    # Language detection
                    if ext in LANGUAGE_EXTENSIONS:
                        lang = LANGUAGE_EXTENSIONS[ext]
                        # Normalize TypeScript variants
                        if lang.startswith("TypeScript"):
                            lang = "TypeScript"
                        elif lang.startswith("JavaScript"):
                            lang = "JavaScript"
                        self.language_counts[lang] += 1
                    
                    # Parse package files (only for known package files)
                    if filename in PACKAGE_PARSERS:
                        try:
                            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                                content = f.read()
                            deps = PACKAGE_PARSERS[filename](content)
                            self.dependencies.update(deps)
                        except Exception:
                            pass
                except OSError:
                    continue
        
        # Detect technologies
        self._detect_technologies()
    
    def _detect_technologies(self):
        """Match detected files and deps against tech signatures"""
        for tech_name, sig in TECH_SIGNATURES.items():
            detected = False
            confidence = 0
            
            # Check files
            if "files" in sig:
                for file_pattern in sig["files"]:
                    for detected_file in self.detected_files:
                        if file_pattern.endswith("/"):
                            # Directory pattern
                            if file_pattern.rstrip("/") in detected_file:
                                detected = True
                                confidence += 2
                                break
                        elif "*" in file_pattern:
                            # Glob pattern
                            if Path(detected_file).match(file_pattern):
                                detected = True
                                confidence += 2
                                break
                        elif detected_file.endswith(file_pattern) or detected_file == file_pattern:
                            detected = True
                            confidence += 2
                            break
            
            # Check dependencies
            if "deps" in sig:
                for dep in sig["deps"]:
                    if dep.lower() in {d.lower() for d in self.dependencies}:
                        detected = True
                        confidence += 1
            
            if detected:
                self.detected_tech[tech_name] = {
                    **sig,
                    "confidence": confidence
                }
    
    def get_results(self) -> Dict:
        """Get scan results as a dictionary"""
        # Calculate language percentages
        total_files = sum(self.language_counts.values())
        lang_percentages = {}
        if total_files > 0:
            for lang, count in self.language_counts.most_common():
                pct = (count / total_files) * 100
                if pct >= 1:  # Only show languages with >= 1%
                    lang_percentages[lang] = round(pct, 1)
        
        # Sort tech by priority and confidence
        priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
        sorted_tech = sorted(
            self.detected_tech.items(),
            key=lambda x: (priority_order.get(x[1].get("priority", "LOW"), 3), -x[1].get("confidence", 0))
        )
        
        return {
            "root": str(self.root),
            "languages": lang_percentages,
            "total_files": total_files,
            "file_extensions": dict(self.file_counts.most_common(20)),
            "detected_technologies": {k: v for k, v in sorted_tech},
            "existing_skills": self.existing_skills,
            "dependency_count": len(self.dependencies),
        }

# =============================================================================
# OUTPUT FORMATTERS
# =============================================================================

def format_ascii_table(results: Dict) -> str:
    """Format results as an ASCII table"""
    lines = []
    
    # Header
    lines.append("╔" + "═" * 78 + "╗")
    lines.append("║" + "CODEBASE ANALYSIS RESULTS".center(78) + "║")
    lines.append("╠" + "═" * 78 + "╣")
    
    # Languages
    lang_str = ", ".join(f"{lang} ({pct}%)" for lang, pct in results["languages"].items())
    if lang_str:
        lines.append("║ " + f"Languages: {lang_str}"[:76].ljust(76) + " ║")
    
    # Total files
    lines.append("║ " + f"Total Source Files: {results['total_files']}"[:76].ljust(76) + " ║")
    
    # Existing skills
    if results["existing_skills"]:
        skills_str = ", ".join(results["existing_skills"][:5])
        if len(results["existing_skills"]) > 5:
            skills_str += f" (+{len(results['existing_skills']) - 5} more)"
        lines.append("║ " + f"Existing Skills: {skills_str}"[:76].ljust(76) + " ║")
    
    # Technologies table
    if results["detected_technologies"]:
        lines.append("╠" + "═" * 78 + "╣")
        lines.append("║" + "SUGGESTED SKILLS".center(78) + "║")
        lines.append("╠" + "═" * 10 + "╦" + "═" * 20 + "╦" + "═" * 35 + "╦" + "═" * 10 + "╣")
        lines.append("║" + "Priority".center(10) + "║" + "Technology".center(20) + "║" + "Doc Source".center(35) + "║" + "Type".center(10) + "║")
        lines.append("╠" + "═" * 10 + "╬" + "═" * 20 + "╬" + "═" * 35 + "╬" + "═" * 10 + "╣")
        
        for tech_name, tech_info in results["detected_technologies"].items():
            priority = tech_info.get("priority", "LOW")
            doc_url = tech_info.get("doc_url", "N/A")
            source_type = tech_info.get("source_type", "website")
            
            # Truncate URL if needed
            if len(doc_url) > 33:
                doc_url = doc_url[:30] + "..."
            
            lines.append(
                "║" + 
                priority.center(10) + "║" + 
                tech_name[:18].center(20) + "║" + 
                doc_url[:33].center(35) + "║" + 
                source_type[:8].center(10) + "║"
            )
        
        lines.append("╚" + "═" * 10 + "╩" + "═" * 20 + "╩" + "═" * 35 + "╩" + "═" * 10 + "╝")
    else:
        lines.append("║ " + "No specific frameworks/libraries detected.".ljust(76) + " ║")
        lines.append("╚" + "═" * 78 + "╝")
    
    # Scraper commands
    if results["detected_technologies"]:
        lines.append("")
        lines.append("SCRAPER COMMANDS:")
        lines.append("-" * 40)
        for tech_name, tech_info in list(results["detected_technologies"].items())[:5]:
            doc_url = tech_info.get("doc_url", "")
            if doc_url:
                lines.append(f"# {tech_name}")
                lines.append(f"python scripts/scrape_url.py {doc_url} {tech_name}-docs.md")
                lines.append("")
    
    return "\n".join(lines)

def format_json(results: Dict) -> str:
    """Format results as JSON"""
    return json.dumps(results, indent=2)

def format_markdown(results: Dict) -> str:
    """Format results as Markdown"""
    lines = ["# Codebase Analysis Results", ""]
    
    # Languages
    if results["languages"]:
        lines.append("## Languages")
        for lang, pct in results["languages"].items():
            lines.append(f"- **{lang}**: {pct}%")
        lines.append("")
    
    # Stats
    lines.append("## Statistics")
    lines.append(f"- Total source files: {results['total_files']}")
    lines.append(f"- Dependencies detected: {results['dependency_count']}")
    lines.append("")
    
    # Detected technologies
    if results["detected_technologies"]:
        lines.append("## Detected Technologies")
        lines.append("")
        lines.append("| Priority | Technology | Documentation | Type |")
        lines.append("|----------|------------|---------------|------|")
        for tech_name, tech_info in results["detected_technologies"].items():
            priority = tech_info.get("priority", "LOW")
            doc_url = tech_info.get("doc_url", "N/A")
            source_type = tech_info.get("source_type", "website")
            lines.append(f"| {priority} | {tech_name} | [{doc_url}]({doc_url}) | {source_type} |")
        lines.append("")
    
    # Existing skills
    if results["existing_skills"]:
        lines.append("## Existing Skills")
        for skill in results["existing_skills"]:
            lines.append(f"- {skill}")
        lines.append("")
    
    return "\n".join(lines)

# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Scan a codebase to identify languages, frameworks, and libraries.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  scan_codebase.py /path/to/project
  scan_codebase.py . --format json
  scan_codebase.py /project --exclude node_modules,dist,build
  scan_codebase.py /project --verbose
"""
    )
    parser.add_argument("directory", nargs="?", default=".", help="Directory to scan (default: current directory)")
    parser.add_argument("--format", "-f", choices=["table", "json", "markdown"], default="table", help="Output format")
    parser.add_argument("--exclude", "-e", help="Comma-separated list of directories to exclude")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show verbose output")
    parser.add_argument("--output", "-o", help="Output file (default: stdout)")
    
    args = parser.parse_args()
    
    # Parse exclusions
    exclude_patterns = ["node_modules", ".git", "dist", "build", "__pycache__", ".next", "venv", ".venv", "target"]
    if args.exclude:
        exclude_patterns = args.exclude.split(",")
    
    # Run scanner
    scanner = CodebaseScanner(args.directory, exclude_patterns)
    
    if args.verbose:
        print(f"Scanning {scanner.root}...", file=sys.stderr)
    
    scanner.scan()
    results = scanner.get_results()
    
    if args.verbose:
        print(f"Found {results['total_files']} source files", file=sys.stderr)
        print(f"Detected {len(results['detected_technologies'])} technologies", file=sys.stderr)
    
    # Format output
    if args.format == "json":
        output = format_json(results)
    elif args.format == "markdown":
        output = format_markdown(results)
    else:
        output = format_ascii_table(results)
    
    # Write output
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output)
        print(f"Results written to {args.output}", file=sys.stderr)
    else:
        print(output)

if __name__ == "__main__":
    main()
