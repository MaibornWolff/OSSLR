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

Also create an access token on GitHub by going to: Settings >> Developer Settings >> Personal Access Tokens >> Generate New Token. Paste your access token into a .env file in the project folder exactly like this: ```ACCES_TOKEN="your-github-acces-token"```.

Secondly, make sure you set the ```FETCH_LICENSE```  environment variable.

For Unix systems:
```
export FETCH_LICENSE=true
```
For Windows systems:
```
set FETCH_LICENSE=true
```


## Usage

To generate a BOM file of your project, run this command inside the project folder.

```
cdxgen -o bom.json
```
To Run the license checker program:

```
npm run license_checker -- "path to your input bom.json"
```

Addtionally one can include a second file with default entries, which then will be included in the output files.

```
npm run license_checker -- "path to your input bom.json" "path to your default bom.json"
```

After the program terminates, you should see two new files in the ```out``` folder:
```updatedBom.json``` and ```updatedBom.pdf```. 

## License

[BSD-3-Clause license](https://github.com/MaibornWolff/OSSLR/blob/develop/LICENSE)
