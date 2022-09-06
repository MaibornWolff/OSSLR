FROM node

RUN mkdir -p /home/app
# Assumption we start in .github/workflows
# but should be in root actually... (try)
COPY . /home/app
RUN git clone https://github.com/MaibornWolff/OSSLR.git /home/app
WORKDIR /home/app/OSSLR
RUN npm install
RUN npm install -g @appthreat/cdxgen
RUN cd ../
# as parameter
#ENV ACCESS_TOKEN=secrets.GITHUB_TOKEN
# default vaules 
ENV FETCH_LICENSE=true
RUN cdxgen -o -bom.json
RUN cd OSSLR
CMD ["npm", "run", "license_checker", "../bom.json" ]