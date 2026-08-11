import { reactive } from "vue";

// Any component can `watch(() => eventBus.lastDataChange, ...)` to know
// when to refetch — updated whenever the chatbot completes an exchange,
// since we can't easily tell from the frontend which replies were pure
// reads versus actions that actually changed something.
export const eventBus = reactive({
  lastDataChange: null,
});