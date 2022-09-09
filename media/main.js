// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    const oldState = vscode.getState() || { configs: [] };

    /** @type {Array<{ value: string }>} */
    let configs = oldState.configs;

    updateCommandList(configs);

    document.querySelector('#add-config-button').addEventListener('click', () => {
        addConfig();
    });

    document.querySelector('#delete-config-button').addEventListener('click', () => {
        deleteConfig();
    });

    document.querySelector('#compare-button').addEventListener('click', () => {
        runCompare();
    });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'addColor': {
                addConfig();
                break;
            }
            case 'reloadConfig': {
                configs = [];
                updateCommandList(configs);
                break;
            }
        }
    });

    function createEditableLable(li, config, colors) {
        // here we create the checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'command-checkbox';
        li.appendChild(checkbox);

        const label = document.createElement('label');
        const input = document.createElement('input');

        label.className = 'command-label';
        label.textContent = config.value;
        label.addEventListener('click', () => {
            // here we open the pipeline
            vscode.postMessage({ type: 'select', value: label.textContent });
        });
        
        label.addEventListener('dblclick', () => {
            // edit the command
            label.style.display = "none";
            input.style.display = "block";
        });
    
        li.appendChild(label);

        input.className = 'command-input';
        input.type = 'text';
        input.value = config.value;
        input.style.display = "none";
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // here we save the command
                label.style.display = "block";
                input.style.display = "none";
                label.textContent = config.value = input.value;
            }
        });

        li.appendChild(input);
    }

    /**
     * @param {Array<{ value: string }>} configs
     */
    function updateCommandList(configs) {
        if (configs === undefined) {
            vscode.setState({ configs: [] });
            return;
        }
        console.log(configs);
        const ul = document.querySelector('.command-list');
        ul.textContent = '';
        for (const config of configs) {
            const li = document.createElement('li');
            li.className = 'command-entry';

            createEditableLable(li, config, configs);
            ul.appendChild(li);
        }

        // Update the saved state
        vscode.setState({ configs: configs });
    }

    /** 
     * @param {string} color 
     */
    function onRunClicked(id) {
        vscode.postMessage({ type: 'run', value: id });
    }

    function onDebugClicked(id) {
        vscode.postMessage({ type: 'debug', value: id });
    }

    function onSelectionChanged(id) {
        vscode.postMessage({ type: 'selection', value: id });
    }

    function addConfig() {
        const command = document.querySelector('.add-config-text').value;
        console.log("addConfig: ", command);
        configs.push({ value: (command === '')? 'clang -O3': command });
        updateCommandList(configs);
    }

    function deleteConfig() {
        const checkboxes = document.querySelectorAll('.command-checkbox');
        for (let i = checkboxes.length-1; i >= 0; i--) {
            if (checkboxes[i].checked) {
                configs.splice(i, 1);
            }
        }
        updateCommandList(configs);
    }

    function runCompare() {
        vscode.postMessage({ type: 'compare', value: configs });
    }
}());

