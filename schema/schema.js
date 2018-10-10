let { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList, GraphQLNonNull} = require('graphql');
const axios = require('axios');

/*order of definition is important*/
const  CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: {type: GraphQLString },
        name: {type: GraphQLString },
        description: {type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(res => res.data)
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLString },
        firstName: { type: GraphQLString},
        age: { type: GraphQLInt},
        company: {
            type: CompanyType,
            resolve(parentValue, args){
                //needed because the property does not meet the incoming data property
                // company /== companyId
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then(res => res.data)
            }
        }
    }
});


/*Root PROVIDES access to GraphQL*/
const RootQuery = new GraphQLObjectType ({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString }},
            resolve(parentValue, args){
                //    This is where we connect with your store to get data
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    .then(res => res.data)            }
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString }},
            resolve(parentValue, args){
                //    This is where we connect with your store to get data
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                    .then(res => res.data)            }
        }
    }
});

/*Mutation*/
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString}
            },
            resolve(parentValue, {firstName, age}){
                return axios.post(`http://localhost:3000/users`, { firstName, age})
                    .then(res => res.data)
            }
        },
        deleteUser:{
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parentValue, {id}){
                return axios.delete(`http://localhost:3000/users/${id}`)
                    .then(res => res.data)
            }
        },
        editUser:{
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)},
                firstName: {type: GraphQLString},
                age: {type: GraphQLInt},
                companyId: {type: GraphQLString}
            },
            resolve(parentValue, args){
                //Patch preserves the previous data not present in the payload
                // return axios.put(`http://localhost:3000/users/${args.id}`, args)
                return axios.patch(`http://localhost:3000/users/${args.id}`, args)
                    .then(res => res.data)
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});
