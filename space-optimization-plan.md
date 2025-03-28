# Space Optimization Plan for Chat Window

## Current Issues
- Desktop mode has a lot of unused space
- Fixed width percentages (60%/40%) may not be optimal for all screen sizes
- Max width constraints could be improved

## Proposed Layout Changes

```mermaid
flowchart TB
    subgraph Current ["Current Layout"]
        A[Chat Window] --> B[Messages 60%]
        A --> C[Preview 40%]
    end
    
    subgraph Proposed ["Proposed Layout"]
        D[Chat Window] --> E[Messages min-w-[500px]]
        D --> F[Preview flex-1]
        E --> G[max-w-[800px]]
    end
```

### Specific Changes

1. Chat Messages Area:
   - Set minimum width instead of percentage (min-w-[500px])
   - Add maximum width for readability (max-w-[800px])
   - Allow natural flex growth

2. Preview Panel:
   - Use flex-1 to take remaining space
   - Set minimum width (min-w-[400px])
   - Add maximum width for very large screens

3. Container Adjustments:
   - Remove fixed percentage widths
   - Use flexible layout with min/max constraints
   - Maintain mobile overlay behavior

### Implementation Details

```typescript
// Chat area class updates
className={cn(
  "overflow-y-auto transition-all duration-300",
  showPreview 
    ? "min-w-[500px] max-w-[800px]" 
    : "w-full max-w-[1200px]"
)}

// Preview panel class updates
className={cn(
  "border-l bg-background",
  isMobile 
    ? "fixed inset-0 z-50" 
    : "flex-1 min-w-[400px] max-w-[600px]"
)}
```

### Benefits
1. Better space utilization on larger screens
2. More natural content flow
3. Improved readability with max-width constraints
4. Maintains responsive behavior
5. Smoother transitions

## Next Steps
1. Switch to Code mode to implement these changes
2. Test on various screen sizes
3. Fine-tune width constraints based on actual content