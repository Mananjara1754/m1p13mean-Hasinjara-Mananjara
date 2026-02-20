// Hooks for Product model

module.exports = (schema) => {
    // Use schema validator for array length limit
    schema.path('images').validate(function (value) {
        // If value is null/undefined, pass (unless required handled elsewhere)
        if (!value) return true;
        return value.length <= 5;
    }, 'You can upload a maximum of 5 images.');


    schema.pre('save', async function () {
        if (this.isModified('price.current')) {
            // Check if there is a previous price history entry to close
            if (this.price_history && this.price_history.length > 0) {
                const lastHistory = this.price_history[this.price_history.length - 1];
                if (!lastHistory.to) {
                    lastHistory.to = new Date();
                }
            }

            // Add new price history entry
            this.price_history.push({
                price: this.price.current,
                from: new Date()
            });
        }
    });
};
