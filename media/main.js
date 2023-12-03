// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    const oldState = vscode.getState() || { configs: [], filter: '' };

    /** @type {Array<{ value: string }>} */
    let configs = oldState.configs || [];
    let filter = oldState.filter;

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

    let text_box = document.querySelector('.filter-text');
    text_box.value = filter;
    text_box.addEventListener('keyup', (e) => {
        filter = text_box.value;
        vscode.postMessage({ type: 'update-filter', value: filter });
        vscode.setState({ configs: configs, filter: filter });
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
            case 'addConfig': {
                configs.push({ value: message.value });
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
        vscode.setState({ configs: configs, filter: filter });
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
        vscode.postMessage({ type: 'new' });
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
        let new_configs = [];
        const checkboxes = document.querySelectorAll('.command-checkbox');
        for (let i = checkboxes.length-1; i >= 0; i--) {
            if (checkboxes[i].checked) {
                new_configs.push(configs[i]);
            }
        }
                
        vscode.postMessage({ type: 'compare', value: new_configs });
    }
}());

