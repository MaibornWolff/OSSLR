# OSSLR

OSSLR is a script that adds copyright notices to your existing CycloneDX Software Bill-of-Materials.

## Features

- OSSLR adds copyright notices to your SBOM
- It currently only supports SBOMs provided in JSON format
- The result can be exported as a PDF or JSON

## Set-up with Docker

- Place the **Dockerfile** into your **project root directory**
- Inside your shell in your **project root directory** run these two commands:
  - ```docker build . osslr_image``` this will create a docker image.
  - ```docker run -v $(pwd)/out:/home/app/OSSLR/out  -e ACCESS_TOKEN="your github access-token -" -e DEFAULT_VALUES="path to the default values" osslr_image``` this will start the container and the **OSSLR** script. The second environment variable namely the **DEFAULT_VALUES** is optional.
- After the program terminates, you should see three new files in the ```out``` folder in your project root directory:
  - ```updatedBom.json```
  - ```updatedBom.pdf```
  - ```missingValues.json``` 

<!--- Alternatively you can clone the OSSLR image from docker hub _-->

## Manual Set-up

Download script for generating SBOM (Software Bill-of-Materials) that will contain the compilation of all project dependencies in JSON and XML format.

```
npm install -g @appthreat/cdxgen
```

Also create an access token on GitHub by going to: Settings >> Developer Settings >> Personal Access Tokens >> Generate New Token. Paste your access token into a .env file in the project folder exactly like this: ```ACCESS_TOKEN="your-github-acces-token"```.

Secondly, make sure you set the ```FETCH_LICENSE```  environment variable.

For Unix systems:
```
export FETCH_LICENSE=true
```
For Windows systems:
```
set FETCH_LICENSE=true
```

To generate a BOM file of your project, run this command inside the project folder.

```
cdxgen -o bom.json
```
To Run the license checker program:

```
npm run license_checker -- "path/to/your/bom.json"
```

Addtionally one can include a second file with default entries, which then will be included in the output file(s):


```
npm run license_checker -- "path/to/your/bom.json" "path/to/your/default.json"
```

In the json format with this structure:
```json
{
    "components": [
        {
            "group": "MaibornWolff",
            "name": "OSSLR",
            "version": "~1.2.3",
            "licenses": [
                {
                    "license": {
                        "id": "1234",
                        "url": "https://best-license.com"
                    }
                }
            ],
            "copyright": "M-Copyright"
        }
    ]
}

```


After the program terminates, you should see two new files in the ```out``` folder: ```updatedBom.json``` and ```updatedBom.pdf```. Furthermore there might be another file ```missingValues.json``` ,which is outputted, if the data retrieval failed for certain packages. These packages are then listed in the aforementioned structure.

## License

[BSD-3-Clause license](https://github.com/MaibornWolff/OSSLR/blob/develop/LICENSE)
