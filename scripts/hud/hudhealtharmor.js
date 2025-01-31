let previousHealth = null;

function onHealthChanged() {
    const healthLabel = $.GetContextPanel().FindChildTraverse('.hud-HA--critical .hud-HA-text .hud-HA-health-label');
    const currentHealth = healthLabel ? parseInt(healthLabel.text) : null;

    if (currentHealth !== previousHealth) {
        // Health has changed, so trigger the animation
        healthLabel.style.animation = 'jitter-number 0.15s ease-out 1'; // Play animation for one iteration
        
        // Store the current health to compare later
        previousHealth = currentHealth;
    }

    // Schedule the next check after 50ms
    $.Schedule(0.05, onHealthChanged);
}

// Start monitoring health changes
$.Schedule(0.05, onHealthChanged);