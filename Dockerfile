FROM debian:latest

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get install -y nodejs

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
RUN echo "deb http://repo.mongodb.org/apt/debian jessie/mongodb-org/3.2 main" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
RUN apt-get update
RUN apt-get install -y mongodb-org

RUN apt-get install -y git build-essential sudo
RUN npm i -g node-gyp

RUN mkdir /var/middleware
RUN cd /var/middleware/ && git clone https://github.com/etdb-dev/api-server.git -b feature/gulp

RUN curl https://raw.githubusercontent.com/mongodb/mongo/master/debian/init.d > /etc/init.d/mongodb
RUN chmod +x /etc/init.d/mongodb

RUN cd /var/middleware/api-server && npm i
RUN useradd -G mongodb etdb
RUN mkdir /var/middleware/api-server/logs
RUN chown -R etdb:etdb /var/middleware/api-server
RUN cp /var/middleware/api-server/config.example.json /var/middleware/api-server/config.json
CMD /etc/init.d/mongodb start; cd /var/middleware/api-server && npm start

EXPOSE 3000 
