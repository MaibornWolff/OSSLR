# OSSLR

## Setup

Download script for generating SBOM (Software Bill-of-Materials) that will contain the compilation of all project dependencies in JSON and XML format.

```
npm install -g @appthreat/cdxgen
```

Also create an access token on GitHub by going to: Settings >> Developer Settings >> Personal Access Tokens >> Generate New Token. Paste your access token into a text file named ```access-token``` in the project folder.

## Usage

Generate BOM file.

```
cdxgen -o bom.json
```

Drag generated file into the ```out``` folder.

Run the program.

```
npm start
```

After the program terminates, you should see two new files in the ```out``` folder:
```updatedBom.json``` and ```updatedBom.pdf```. 

