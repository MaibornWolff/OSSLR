# OSSLR

OSSLR is a script that adds copyright notices to your existing CycloneDX Software Bill-of-Materials.

## Features

- OSSLR adds copyright notices to your SBOM
- It currently only supports SBOMs provided in JSON format
- The result can be exported as a PDF or JSON

## Setup

Download script for generating SBOM (Software Bill-of-Materials) that will contain the compilation of all project dependencies in JSON and XML format.

```
npm install -g @appthreat/cdxgen
```

Also create an access token on GitHub by going to: Settings >> Developer Settings >> Personal Access Tokens >> Generate New Token. Paste your access token into a text file named ```access-token``` in the project folder.

## Usage

First make sure you have set your ACCES_TOKEN="your-github-acces-token" environment variable in a .env file inside the root directory.

Secondly make sure you set a second environemnt variable:
For Unix systems:
```
export FETCH_LICENSE=true
```
For Windows systems:
```
set FETCH_LICENSE=true
```

Then proceed to generating a BOM file.

```
cdxgen -o bom.json
```

Drag generated file into the ```out``` folder.

To Run the license checker program:

```
npm run license_checker -- "path to your input bom.json"
```

After the program terminates, you should see two new files in the ```out``` folder:
```updatedBom.json``` and ```updatedBom.pdf```. 

## License

[BSD-3-Clause license](https://github.com/MaibornWolff/OSSLR/blob/develop/LICENSE)
