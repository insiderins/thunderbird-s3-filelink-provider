const form = document.querySelector("form");
const save = form.querySelector("button[name=save]");
const statusMessage = document.getElementById("statusMessage");
const accountId = new URL(location.href).searchParams.get("accountId");
const fields = [
    "endpoint",
    "region",
    "bucket",
    "prefix",
    "access_key",
    "secret_key",
];

function getInput(name) {
    return form.querySelector(`input[name="${name}"]`);
}

function setInputValueFromAccountInfo(fieldName, account) {
    if (fieldName in account) {
        getInput(fieldName).value = account[fieldName];
    }
}

function setFormDisableState(disabled) {
    save.disabled = disabled;
    save.textContent = disabled ? "⏳ Saving..." : "💾 Save Configuration";
    fields.forEach((name) => {
        getInput(name).disabled = disabled;
    });
}

function showStatus(message, type = "success") {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = "block";

    if (type === "success") {
        setTimeout(() => {
            statusMessage.style.display = "none";
        }, 3000);
    }
}

function validateEndpoint(endpoint) {
    // Remove protocol if present
    const cleanEndpoint = endpoint.replace(/^https?:\/\//, "");

    // Basic validation for endpoint format
    const endpointRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-\.]*[a-zA-Z0-9])?$/;
    return endpointRegex.test(cleanEndpoint);
}

function validateBucket(bucket) {
    // S3 bucket naming rules
    const bucketRegex = /^[a-z0-9][a-z0-9\-]*[a-z0-9]$/;
    return (
        bucket.length >= 3 && bucket.length <= 63 && bucketRegex.test(bucket)
    );
}

(() => {
    // Initialize i18n
    for (let element of document.querySelectorAll("[data-i18n]")) {
        const message = browser.i18n.getMessage(element.dataset.i18n);
        if (message) {
            element.textContent = message;
        }
    }

    // Load existing account data
    browser.storage.local
        .get(accountId)
        .then((account) => {
            if (!account[accountId]) {
                showStatus("Please configure your S3 settings below", "info");
                return;
            }

            fields.forEach((fieldName) => {
                setInputValueFromAccountInfo(fieldName, account[accountId]);
            });

            showStatus("Configuration loaded successfully", "success");
        })
        .catch((error) => {
            console.error("Error loading account data:", error);
            showStatus("Error loading existing configuration", "error");
        });

    // Add real-time validation
    getInput("endpoint").addEventListener("blur", (e) => {
        const value = e.target.value.trim();
        if (value && !validateEndpoint(value)) {
            showStatus(
                "Invalid endpoint format. Use format like: s3.amazonaws.com",
                "error"
            );
        }
    });

    getInput("bucket").addEventListener("blur", (e) => {
        const value = e.target.value.trim();
        if (value && !validateBucket(value)) {
            showStatus(
                "Invalid bucket name. Use lowercase letters, numbers, and hyphens only",
                "error"
            );
        }
    });

    // Auto-clean prefix
    getInput("prefix").addEventListener("blur", (e) => {
        let value = e.target.value.trim();
        if (value && !value.endsWith("/")) {
            value += "/";
            e.target.value = value;
        }
    });
})();

save.onclick = async () => {
    try {
        // Validate form
        if (!form.checkValidity()) {
            showStatus("Please fill in all required fields", "error");
            return;
        }

        // Additional validation
        const endpoint = getInput("endpoint").value.trim();
        const bucket = getInput("bucket").value.trim();

        if (!validateEndpoint(endpoint)) {
            showStatus("Invalid endpoint format", "error");
            return;
        }

        if (!validateBucket(bucket)) {
            showStatus("Invalid bucket name format", "error");
            return;
        }

        setFormDisableState(true);
        showStatus("Saving configuration...", "info");

        // Collect form data
        let accountInfo = {};
        fields.forEach((name) => {
            let value = getInput(name).value.trim();

            // Clean endpoint (remove protocol)
            if (name === "endpoint") {
                value = value.replace(/^https?:\/\//, "");
            }

            // Ensure prefix ends with /
            if (name === "prefix" && value && !value.endsWith("/")) {
                value += "/";
            }

            accountInfo[name] = value;
        });

        // Save to storage
        await browser.storage.local.set({
            [accountId]: accountInfo,
        });

        // Update account status
        await browser.cloudFile.updateAccount(accountId, { configured: true });

        showStatus(
            "✅ Configuration saved successfully! You can now use S3 FileLink in Thunderbird.",
            "success"
        );
    } catch (error) {
        console.error("Error saving configuration:", error);
        showStatus("❌ Error saving configuration. Please try again.", "error");
    } finally {
        setFormDisableState(false);
    }
};
