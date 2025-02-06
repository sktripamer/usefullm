# UsefulLM CLI

Expedite your workflows when working with LLMs to enable a more efficient and collaborative development process. Copy entire directory trees and their files into an LLM friendly format, bulk summarization of files, and more coming soon.

Vastly speed up your work with LLMs, especially when refactoring large codebases and adding new features into existing systems.

## Features

- **Copy Directory Contents (`cpdir`):**  
  Copy the contents of a directory to your clipboard in markdown format. Each file is formatted with a markdown header and code block. Binary files are automatically marked as `[binary file]`.

- **Generate Directory Tree (`dirtree`):**  
  Generate a directory tree and copy it to your clipboard in various formats (markdown, JSON, or XML). Filter by file extensions, exclude specific paths, and control the depth of the tree.

- **Summarize Files (`summ`):**  
  Summarize the contents of a file or directory using an LLM. The summary is copied to your clipboard for easy sharing.

- **Command History (`history`):**  
  View and manage a history of your five most recent commands and their outputs. Copy specific outputs back to your clipboard for reuse.

- **Last Command Output (`last`):**  
  Quickly copy the output of your most recent command to the clipboard.

- **Configuration Management (`config`):**  
  View or update your LLM configuration, including the API URL and API key.

---

## Installation

To install UsefulLM globally, run:

```bash
npm install -g @sktripamer/usefullm
```

If you want to use the summarize command (and many more commands to follow), you'll need an LLM configured with an OpenAI-compatible LLM. Here's the easiest way to get started:

Download [Ollama](https://ollama.com) and make sure the CLI gets installed (Run the application and it should prompt you to install the CLI).

After the CLI is installed, run:
```bash
ollama pull llama3.2
ollama serve
```

Now you're ready to go with LLM enabled commands! The default config is set up for the above setup, but you can update it to anything you want:

```bash
# Set LLM API URL
usefullm config url http://localhost:8000/v1/chat/completions

# Set LLM model (this is the one that's running on your local server or remote service)
usefullm config model llama3.3

```

The default Llama3.2 is a 3B parameter model, having a good balance between performance and capacity. You can download and run more powerful ones, just make sure to update the configuration. The v1/chat/completions endpoint is the most tested one, so it's probably the best to use.

---

## Commands

### 1. **Copy Directory Contents (`cpdir`)**
Copy the contents of a directory to your clipboard in markdown format.

```bash
usefullm cpdir [directory] [options]
```

**Options:**
- `--all`: Include all files, ignoring `.gitignore` patterns.

**Examples:**
```bash
# Copy current directory contents (respecting .gitignore)
usefullm cpdir

# Copy specific directory contents (respecting .gitignore)
usefullm cpdir /path/to/directory

# Copy all files, including those in .gitignore
usefullm cpdir --all
```

---

### 2. **Generate Directory Tree (`dirtree`)**
Generate a directory tree and copy it to your clipboard in various formats.

```bash
usefullm dirtree [directory] [options]
```

**Options:**
- `-d, --depth <depth>`: Maximum depth to traverse (default: 20).
- `-i, --ignore <patterns...>`: Patterns to ignore (e.g., `node_modules`).
- `-a, --all`: Include all files, ignoring `.gitignore` rules.
- `-f, --format <format>`: Output format (`markdown`, `json`, or `xml`) (default: `markdown`).

**Examples:**
```bash
# Generate tree for current directory in markdown format
usefullm dirtree

# Generate JSON tree for specific directory
usefullm dirtree ./my-project -t json

# Generate tree excluding node_modules
usefullm dirtree -i "node_modules"

# Generate tree with maximum depth of 2
usefullm dirtree -d 2
```

---

### 3. **Summarize Files (`summ`)**
Summarize the contents of a file or directory using an LLM.

```bash
usefullm summ [path] [options]
```

**Options:**
- `-t, --tokens <tokens>`: Maximum tokens per summary (default: 1000).
- `-a, --all`: Include all files, ignoring `.gitignore` rules.

**Examples:**
```bash
# Summarize current directory
usefullm summ

# Summarize specific file
usefullm summ /path/to/file.txt

# Summarize directory with custom token limit
usefullm summ ./my-project -t 500
```

---

### 4. **Command History (`history`)**
View or copy specific outputs from your command history.

```bash
usefullm history [index]
```

**Examples:**
```bash
# View full command history
usefullm history

# Copy output of specific history item to clipboard
usefullm history 2
```

---

### 5. **Last Command Output (`last`)**
Copy the output of your most recent command to the clipboard.

```bash
usefullm last
```

---

### 6. **Configuration Management (`config`)**
View or update your LLM configuration.

```bash
usefullm config [key] [value]
```

**Examples:**
```bash
# View current configuration
usefullm config

# Set LLM API URL
usefullm config url http://localhost:8000/v1/chat/completions

# Set LLM model (this is the one that's running on your local server or remote service)
usefullm config model llama3.2

# Set LLM API key
usefullm config key your-api-key

# Clear your API key
usefullm config key
```

---

## Contributing

Have a common workflow in mind? Open an issue on the [GitHub repository](https://github.com/sktripamer/usefullm) and I can get you set up. Your feedback is highly appreciated!