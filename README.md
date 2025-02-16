# Natural Deduction
This is a tool to help you learn natural deduction. Since drawing derivation trees is very cumbersome, this tools helps with:
- Highlitening makes matching easier
- Rules can not incorrectly be applied
- Checking if the tree is still feasable


## Developing

This project consists of three parts: Frontend, Backend and Database.

1. Copy the ```template.env``` to ```.env``` and add the missing fields.
2. Start the database ```docker compose up postgres```
3. Add the `POSTGRES_URL` to your shell environment
4. Setup the database tables. This is using prisma.
    - ```cd frontend```
    - ```npm i``` install all the packages
    - ```npx prisma db push --schema ../db/schema.prisma``` push the database schema to the docker.
5. Now we can start the backend. ```cargo run```
6. Finally the frontend can be run.
    - Make sure to set the API base path in the shell environment (see ```frontend/rest.env```)
    - Run ```npm run dev```

### Database Migration
If you change the database schema you need to manually push the file again to the database. Additionally, in the backend run 

```shell
npx prisma db push --schema ../db/schema.prisma --database-url ...
```
to update the rust crate with the new database structure.

### API changes
To be able to use new or changed endpoints in the frontend the following steps must be done:
1. Copy the openAPI config from ```localhost:8000/docs/api``` into ```frontend/src/lib/api/apigen/schema.json```
2. Run ```npm run apigen```


### Disclaimer
This is not official software for the FMFP course at ETHZ. There are no guarantees for correctness.


