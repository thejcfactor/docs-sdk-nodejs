/*
 * Copyright (c) 2024 Couchbase, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import couchbase from 'couchbase'

async function main() {
    // tag::connect[]
    // For a secure cluster connection, use `couchbases://<your-cluster-ip>` instead.
    const clusterConnStr = 'couchbase://localhost'
    const username = 'Administrator'
    const password = 'password'
    const bucketName = 'travel-sample'

    const cluster = await couchbase.connect(clusterConnStr, {
        username: username,
        password: password,
    })
    // end::connect[]

    const bucket = cluster.bucket(bucketName)

    const collection = bucket.scope('inventory').collection('airport')

    const json = {
        "status": "awesome"
    }

    const docId = crypto.randomUUID()
    await collection.upsert(docId, json)

    try {
        let getResult = await collection.get(docId)
        console.log('Couchbase is ' + getResult.content.status)
    } catch (e) {
        if (e instanceof couchbase.DocumentNotFoundError) {
            console.log("Document does not exist")
        } else {
            console.log(`Error: ${e}`)
        }
    }

    const newJson = {
        "status": "fast"
    }

    const replaceOpts = {
        expiry: 10,
        durabilityLevel: DurabilityLevel.Majority
    }
    await collection.replace(docId, newJson, replaceOpts)

    await collection.remove(docId)
}

// Run the main function
main()
    .catch((err) => {
        console.log('ERR:', err);
        process.exit(1);
    })
    .then(() => process.exit());
