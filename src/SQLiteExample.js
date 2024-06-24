import { View, Text } from 'react-native'
import React from 'react'

const initDB = async () => {
    try {
        const db = await SQLite.openDatabase({ name: 'your-database-name.db', location: 'default' });
        console.log('Database opened');

        // Créez les tables nécessaires
        await db.executeSql('CREATE TABLE IF NOT EXISTS your-table-name (id INTEGER PRIMARY KEY AUTOINCREMENT, column1 TEXT, column2 INTEGER)');

        // Insérez des données initiales (si nécessaire)
        await db.executeSql('INSERT INTO your-table-name (column1, column2) VALUES (?, ?)', ['data1', 10]);

        // ... (autres opérations SQL)
    } catch (error) {
        console.error('SQLite error:', error);
    }
};
initDB();


const SQLiteExample = () => {
  return (
    <View>
      <Text>SQLiteExample</Text>
    </View>
  )
}

export default SQLiteExample