import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
      },
      
      imageIndex: {
        width: 300,
        height: 300,
        borderRadius: 10,
        borderWidth:4,
        borderColor: '#F00'
    },
  
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      container: {
          flex: 1,
          justifyContent: 'center',
          alignItems:  'center',
          padding: 40,
        },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 10,
    },
    description: {
      fontSize: 16,
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 20,
    },
    btn: {
      width: '80%',
      paddingVertical: 15,
      borderRadius: 25,
      alignItems: 'center',
      marginVertical: 10,

      flexDirection: 'row',
      justifyContent: 'center',
    },
    backButton: {
      position: 'absolute',
      top: 40,
      left: 10,
      zIndex: 99,
  },
  icon: {
    margin: 10,
  },
  
    btnTextWhite: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
      },
    btnTextBlack: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
      },
      btnYellow: {
        backgroundColor: '#FFD700',
      },
      btnGreen: {
        backgroundColor: '#080',
      },
    
    btnSecondary: {
      borderColor: '#FFFFFF',
      backgroundColor: 'rgba(200,200,200,0.4)',
      borderWidth: 2,
    },
    btnSecondaryText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },

    //*******************info****************/

    
      alert: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 10,
        margin: 100,
        marginTop: 0,
        backgroundColor: '#070',
        borderRadius: 20,
        zIndex: 1000,
      },
      alertRed: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 10,
        margin: 80,
        marginTop: 0,
        backgroundColor: '#F00',
        borderRadius: 20,
        zIndex: 1000,
      },
      alertText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
      },
      icon: {
        marginBottom: 20,
      },
     
      infoContainer: {
        backgroundColor: 'rgba(190,190,190,0.4)',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        width: '100%',
      },
      infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      info: {
        fontSize: 14,
        marginBottom: 1,
      },

      //******************Login***************** */

      input: {
        fontSize: 18,
        width: '80%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 50,
        color:'#000',
        backgroundColor: 'rgba(255, 255,255, 0.895)',
        textAlign: 'center',
      },


      
      //****************** Test Cam ***************** */
      
    
    
    image: {
        width: 200,
        height: 200,
        margin: 10,
        borderRadius: 30,
    },
    
    
    btnPrecNext: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    
    btnPrec  : {
      padding: 15,
      borderRadius: 25,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    
     btnNext : {
      
      padding: 15,
      borderRadius: 25,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    /************************* MAP************************** */
    containerMap: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    text: {
      textAlign: 'center',
      fontSize: 16,
      marginTop: 10,
    },
    
    btnMap: {
      paddingVertical: 5,
      margin: 12,
      borderRadius: 25,
      alignItems: 'center',
      marginVertical: 10,
      flexDirection: 'row',
      justifyContent: 'center',
    },
     


    /*************************** ACCUEIL************************************** */
    
    
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 80,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.3)', // Couleur de fond de la barre de navigation
    },
    bottomBarButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    


    /**************************** USERS ***************************************** */
    
   
  
    inputUpdate: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      marginBottom: 10,
      borderRadius: 8,
      backgroundColor: '#fff',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    image: {
      width: 100,
      height: 100,
      margin: 10,
      borderRadius: 8,
    },
    storedDataContainer: {
      marginTop: 20,
      backgroundColor: 'rgba(10,10,50,0.59)',
      padding: 10,
      borderRadius: 32,
      borderColor: '#444',
      borderWidth: 1,
    },
    storedDataTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFF',
    },
    storedData: {
      fontSize: 16,
      color: '#999',
    },
    buttonGroup: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
    },
    buttonChild: {
      backgroundColor: 'rgba(0, 0, 150, 0.5)',
      color: '#F00',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 8,
      width: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },




  
  });

  export default styles;