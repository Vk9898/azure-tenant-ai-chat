import { chatStore, useChat } from "@/components/chat-page/chat-store";
import { RefObject, useEffect } from "react";

export const useChatScrollAnchor = (props: {
  ref: RefObject<HTMLDivElement | null>;
}) => {
  const { ref } = props;

  const { autoScroll } = useChat();

  // This effect handles the user's scroll event
  useEffect(() => {
    const currentRef = ref.current;
    const handleUserScroll = () => {
      if (currentRef) {
        const userScrolledUp =
          currentRef.scrollTop + currentRef.clientHeight <
          currentRef.scrollHeight;

        chatStore.updateAutoScroll(!userScrolledUp);
      }
    };

    currentRef?.addEventListener("scroll", handleUserScroll);

    // Cleanup: remove the event listener when the component unmounts or the dependencies change
    return () => {
      currentRef?.removeEventListener("scroll", handleUserScroll);
    };
  }, [ref]);

  // This effect handles the automatic scroll to bottom
  useEffect(() => {
    const currentRef = ref.current;
    const handleAutoScroll = () => {
      if (currentRef && autoScroll) {
        currentRef.scrollTop = currentRef.scrollHeight;
      }
    };

    const observer = new MutationObserver(handleAutoScroll);

    if (currentRef) {
      observer.observe(currentRef, { childList: true, subtree: true });
    }

    // Cleanup: disconnect the observer when the component unmounts or the dependencies change
    return () => {
      observer.disconnect();
    };
  }, [ref, autoScroll]);
};
