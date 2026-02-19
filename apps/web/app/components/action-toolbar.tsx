import { useState } from 'react'
import type { Workspace } from '@workspacekit/types'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Plus,
  Play,
  Square,
  Trash2,
  RotateCcw,
  ChevronDown,
  LayoutGrid,
  List,
  RefreshCw,
  ExternalLink,
  Timer,
  Copy,
  Scaling,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ViewMode = 'table' | 'cards'

interface ActionToolbarProps {
  selected: Workspace[]
  onAction: (action: string, targets: Workspace[]) => void
  onCreateClick: () => void
  onRefresh: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  filterText: string
  onFilterChange: (text: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActionToolbar({
  selected,
  onAction,
  onCreateClick,
  onRefresh,
  viewMode,
  onViewModeChange,
  filterText,
  onFilterChange,
}: ActionToolbarProps) {
  const hasSelection = selected.length > 0
  const hasRunning = selected.some((w) => w.running)
  const hasStopped = selected.some((w) => !w.running && !w.creating)

  return (
    <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 shadow-[var(--shadow-card)]">
      {/* Primary actions */}
      <Button size="xs" onClick={onCreateClick}>
        <Plus className="h-3 w-3" />
        Create
      </Button>

      <div className="h-4 w-px bg-border" />

      <Button
        variant="outline"
        size="xs"
        disabled={!hasStopped}
        onClick={() => onAction('start', selected)}
        className="text-success border-success/30 hover:bg-success/10 disabled:text-muted-foreground disabled:border-border"
      >
        <Play className="h-3 w-3" />
        Start
      </Button>
      <Button
        variant="outline"
        size="xs"
        disabled={!hasRunning}
        onClick={() => onAction('stop', selected)}
        className="text-warning border-warning/30 hover:bg-warning/10 disabled:text-muted-foreground disabled:border-border"
      >
        <Square className="h-3 w-3" />
        Stop
      </Button>
      <Button
        variant="outline"
        size="xs"
        disabled={!hasSelection}
        onClick={() => onAction('delete', selected)}
        className="text-destructive border-destructive/30 hover:bg-destructive/10 disabled:text-muted-foreground disabled:border-border"
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </Button>
      <Button
        variant="outline"
        size="xs"
        disabled={!hasSelection}
        onClick={() => onAction('rebuild', selected)}
      >
        <RotateCcw className="h-3 w-3" />
        Rebuild
      </Button>

      <div className="h-4 w-px bg-border" />

      {/* Actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="xs" disabled={!hasSelection}>
            Actions
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => onAction('open-vscode', selected)}
            disabled={!hasRunning}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open VSCode
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction('set-timer', selected)}>
            <Timer className="h-3.5 w-3.5" />
            Set Timer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction('duplicate', selected)}>
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction('resize', selected)}>
            <Scaling className="h-3.5 w-3.5" />
            Resize
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Filter */}
      <Input
        className="h-6 w-40 text-xs"
        placeholder="Filter..."
        value={filterText}
        onChange={(e) => onFilterChange(e.target.value)}
      />

      {/* View toggle */}
      <div className="flex items-center rounded border border-border">
        <button
          onClick={() => onViewModeChange('table')}
          className={`p-1 ${viewMode === 'table' ? 'bg-muted' : 'hover:bg-muted/50'}`}
        >
          <List className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={() => onViewModeChange('cards')}
          className={`p-1 ${viewMode === 'cards' ? 'bg-muted' : 'hover:bg-muted/50'}`}
        >
          <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Refresh */}
      <Button variant="ghost" size="icon-xs" onClick={onRefresh}>
        <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  )
}
