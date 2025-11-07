<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Modal Example</title>
  <style>
    /* Modal background overlay */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      visibility: hidden;
      opacity: 0;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .modal-overlay.active {
      visibility: visible;
      opacity: 1;
    }

    /* Modal box */
    .modal {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      width: 24rem; /* same as w-96 */
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
    }
