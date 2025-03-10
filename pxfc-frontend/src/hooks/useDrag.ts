import { useState, useRef, useEffect } from "react";

/**
 * A custom hook for making elements draggable
 *
 * @param {number} initialValue - Initial value for the dragged element dimension
 * @param {number} min - Minimum value allowed for dragging
 * @param {number} max - Maximum value allowed for dragging
 * @param {string} direction - Direction of dragging: 'horizontal' or 'vertical'
 * @returns {Object} - Object containing value, isDragging state, and dragHandleRef
 */
export function useDrag(
  initialValue: number = 320,
  min: number = 250,
  max: number = 500,
  direction: "horizontal" | "vertical" = "horizontal"
) {
  const [value, setValue] = useState<number>(initialValue);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Ref for the drag handle element
  const dragHandleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleRef = dragHandleRef.current;
    if (!handleRef) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      let newValue;
      if (direction === "horizontal") {
        newValue = e.clientX;
      } else {
        newValue = e.clientY;
      }

      if (newValue >= min && newValue <= max) {
        setValue(newValue);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    // Handle touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      setIsDragging(true);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;

      let newValue;
      if (direction === "horizontal") {
        newValue = e.touches[0].clientX;
      } else {
        newValue = e.touches[0].clientY;
      }

      if (newValue >= min && newValue <= max) {
        setValue(newValue);
      }

      // Prevent page scrolling while dragging
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    // Add event listeners
    handleRef.addEventListener("mousedown", handleMouseDown);
    handleRef.addEventListener("touchstart", handleTouchStart as EventListener);

    return () => {
      // Clean up all event listeners
      handleRef.removeEventListener("mousedown", handleMouseDown);
      handleRef.removeEventListener(
        "touchstart",
        handleTouchStart as EventListener
      );
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, min, max, direction]);

  // Track cursor style for UX
  useEffect(() => {
    if (!dragHandleRef.current) return;

    const cursor = direction === "horizontal" ? "col-resize" : "row-resize";

    if (isDragging) {
      document.body.style.cursor = cursor;
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    if (dragHandleRef.current) {
      dragHandleRef.current.style.cursor = cursor;
    }

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, direction]);

  return {
    value,
    setValue, // Allow external control if needed
    isDragging,
    dragHandleRef,
  };
}
