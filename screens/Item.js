import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/style';
import { ListeHumain } from '../components/ListeHumain';

const Item = ({ navigation }) => {
    const [compteurHumain, setcompteurHumain] = useState(0);
    const [ages, setAges] = useState(ListeHumain.map(humain => humain.age));

    const onNext = () => {
        if (compteurHumain === ListeHumain.length - 1) {
            setcompteurHumain(0);
        } else {
            setcompteurHumain(compteurHumain + 1);
        }
    }

    const onPrev = () => {
        if (compteurHumain === 0) {
            setcompteurHumain(ListeHumain.length - 1);
        } else {
            setcompteurHumain(compteurHumain - 1);
        }
    }

    const augmenterAge = (index) => {
        const newAges = [...ages];
        newAges[index] += 1;
        setAges(newAges);
    }

    const Humain = (props) => {
        return (
            <View style={styles.content}>
                <Text style={styles.infoTitle}>Voici une personne</Text>
                <Text style={styles.infoTitle}>Son nom est {props.prenoms} {props.nom}, et qui a {props.age} ans.</Text>
                {props.estHomme ? <Text style={styles.infoTitle}>C'est un homme</Text> : <Text style={styles.infoTitle}>C'est une femme</Text>}

                <TouchableOpacity onPress={props.augmenterAge}>
                    <Image
                        source={props.src}
                        style={styles.imageIndex}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <FontAwesomeIcon name="arrow-left" size={20} color="#000" />
            </TouchableOpacity>

            <Humain
                id={ListeHumain[compteurHumain].id}
                nom={ListeHumain[compteurHumain].nom}
                prenoms={ListeHumain[compteurHumain].prenoms}
                age={ages[compteurHumain]}
                estHomme={ListeHumain[compteurHumain].estHomme}
                src={ListeHumain[compteurHumain].src}
                augmenterAge={() => augmenterAge(compteurHumain)}
            />

            <Text>Valeur : {compteurHumain}</Text>

            <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={onNext}>
                <FontAwesomeIcon name="arrow-right" size={20} color="#fff" />
                <Text style={styles.btnTextWhite}> Suivant</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={onPrev}>
                <FontAwesomeIcon name="arrow-left" size={20} color="#fff" />
                <Text style={styles.btnTextWhite}> Précédent</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={() => navigation.goBack()}>
                <FontAwesomeIcon name="arrow-left" size={20} color="#fff" />
                <Text style={styles.btnTextWhite}> Retour</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.btnYellow]} onPress={() => navigation.navigate('Login')}>
                <FontAwesomeIcon name="sign-in" size={20} color="#fff" />
                <Text style={styles.btnTextWhite}> Login</Text>
            </TouchableOpacity>
        </View>
    );
}

export default Item;
