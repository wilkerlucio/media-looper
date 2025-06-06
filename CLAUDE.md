# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm i` - Install dependencies
- `pnpm run dev` - Start development mode (opens browser with extension in dev mode)
- `pnpm run dev:firefox` - Development mode for Firefox
- `pnpm run build` - Build extension for production
- `pnpm run build:firefox` - Build for Firefox
- `pnpm run zip` - Create Chrome extension package
- `pnpm run zip:firefox` - Create Firefox extension package
- `pnpm run check` - Run Svelte type checking

## Architecture Overview

This is a browser extension for YouTube that allows users to create custom loops for video segments. Built with WXT framework, Svelte 5, TinyBase for data management, and TailwindCSS.

### Key Components

**Data Layer:**
- Uses TinyBase as primary data store with relationships between medias and loops
- Supports real-time sync via WebSocket connections to external servers
- IndexedDB persistence for offline data
- Import/export functionality for data migration

**Extension Structure:**
- `background.ts` - Service worker managing data persistence and sync
- `popup/` - Extension popup interface for quick access
- `dashboard/` - Full management interface for loops and settings
- `youtube.content.ts` - Content script injected into YouTube pages

**Core Logic:**
- `model.ts` - TypeScript interfaces for Loop, Media, and related types
- `controller.ts` - Business logic operations on TinyBase store
- `logic/` - Pure functions for loop manipulation and database operations
- `stores/` - Svelte reactive stores and state management

### Data Flow

1. Content script detects YouTube videos and injects UI controls
2. User interactions create/modify loops through TinyBase store
3. Background script syncs data to IndexedDB and optional WebSocket server
4. Dashboard provides admin interface for bulk operations and settings

### Development Notes

- Extension uses WXT's manifest v3 configuration
- Svelte components use the new runes syntax (Svelte 5)
- TinyBase relationships connect media entries to their associated loops
- WebSocket sync is optional and configured through dashboard settings