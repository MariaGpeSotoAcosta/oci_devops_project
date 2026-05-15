# Tests

## Setup

### Activate Virtual Environment

To start the virtual environment, navigate to the `Tests` folder and run:

```bash
source .venv/bin/activate
```

## Configurations

Before running any tests first intall all de libraries using the following command:
```bash
pip install -r requirements.txt
```

## Running Tests

To run the tests with output visible in the console:

```bash
pytest -s
```
The tests are done using google chrome version 145, be sure to have it installed

## Deactivate Virtual Environment

When you're done, you can deactivate the virtual environment:

```bash
deactivate
```
## Organization
You can find the test files in the folder test, make sure to make a folder for the specific feature you are making

All the functions and constants should be created in the pages folder, you should also add a folder of your feature there

Inside you can create three files: Functions, Selectors and String Constants

Any PR with magic values will not be approved

### Functions
All the abstractions you will use in your testing, this includes commonly repeated methods and long functions

### Selectors
CSS selectors you will use as reference

### String Constants
Name this file in a way that describes what the strings represents i.e. "Messages".

This string are used to make assertions