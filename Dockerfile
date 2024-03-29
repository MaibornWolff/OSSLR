FROM node

RUN mkdir -p /home/app
COPY . /home/app/
RUN git clone https://github.com/MaibornWolff/OSSLR.git /home/app/OSSLR
WORKDIR /home/app/OSSLR
RUN mkdir out
RUN touch out/updatedBom.pdf
RUN touch out/updatedBom.json
RUN touch out/missingValues.json
RUN npm install
RUN npm install -g @appthreat/cdxgen
WORKDIR /home/app/
ENV FETCH_LICENSE=true
RUN cdxgen -o bom.json
WORKDIR /home/app/OSSLR
CMD if ! [ -z "${DEFAULT_VALUES}" ]; then DEFAULT_VALUES="../${DEFAULT_VALUES}";else DEFAULT_VALUES=""; fi ; npm run license_checker -- -p "../bom.json" -d ${DEFAULT_VALUES}