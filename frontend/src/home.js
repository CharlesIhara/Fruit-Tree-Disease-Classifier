// React hooks
import { useState, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";

// Material-UI components and styling
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Container from "@material-ui/core/Container";
import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Paper, CardActionArea, CardMedia, Grid, TableContainer, Table, TableBody, TableHead, TableRow, TableCell, Button, CircularProgress } from "@material-ui/core";
import image from "./apple_bg_img.jpg";

// File upload components
import { DropzoneArea } from 'material-ui-dropzone';
import { common } from '@material-ui/core/colors';
import Clear from '@material-ui/icons/Clear';
import axios from "axios";


// Custom button (used as the button to clear image)
const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(common.white),
    backgroundColor: common.white,
    '&:hover': {
      backgroundColor: '#ffffff7a',
    },
  },
}))(Button);
//const axios = require("axios").default;

// Custom Styles for components
const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  clearButton: {
    width: "-webkit-fill-available",
    borderRadius: "15px",
    padding: "15px 22px",
    color: "#000000a6",
    fontSize: "20px",
    fontWeight: 900,
  },
  root: {
    maxWidth: 345,
    flexGrow: 1,
  },
  media: {
    height: 400,
  },
  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
    maxWidth: 500,
  },
  gridContainer: {
    justifyContent: "center",
    padding: "4em 1em 0 1em",
  },
  mainContainer: {
    backgroundImage: `url(${image})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    minHeight: "100vh",
    marginTop: "8px",
  },
  imageCard: {
    margin: "auto",
    maxWidth: 600,
    height: 500,
    //backgroundColor: 'transparent',
    boxShadow: '0px 9px 70px 0px rgb(0 0 0 / 30%) !important',
    borderRadius: '15px',
    backgroundColor: "rgba(255,255,255,0.3)",
    backdropFilter: "blur(10px)"
  },
  imageCardEmpty: {
    height: 'auto',
  },
  noImage: {
    margin: "auto",
    width: 400,
    height: "400 !important",
  },
  input: {
    display: 'none',
  },
  uploadIcon: {
    background: 'white',
  },
  tableContainer: {
    backgroundColor: 'transparent !important',
    boxShadow: 'none !important',
  },
  table: {
    backgroundColor: 'transparent !important',
  },
  tableHead: {
    backgroundColor: 'transparent !important',
  },
  tableRow: {
    backgroundColor: 'transparent !important',
  },
  tableCell: {
    fontSize: '22px',
    backgroundColor: 'transparent !important',
    borderColor: 'transparent !important',
    color: '#000000a6 !important',
    fontWeight: 'bolder',
    padding: '1px 24px 1px 16px',
  },
  tableCell1: {
    fontSize: '14px',
    backgroundColor: 'transparent !important',
    borderColor: 'transparent !important',
    color: '#000000a6 !important',
    fontWeight: 'bolder',
    padding: '1px 24px 1px 16px',
  },
  tableBody: {
    backgroundColor: 'transparent !important',
  },
  text: {
    color: 'white !important',
    textAlign: 'center',
  },
  buttonGrid: {
    maxWidth: "416px",
    width: "100%",
  },
  detail: {
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  appbar: {
    background: '#be6a77',
    boxShadow: 'none',
    color: 'white'
  },
  loader: {
    color: '#be6a77 !important',
  },
  // styling for website title
  title: {
    fontSize: "3rem",  // bigger font
    fontWeight: 700,    // bold
  },
  // styling for processing text
  process_title: {
    fontSize: "30px",  // bigger font
    fontWeight: 600,    // bold
  },
  content: {
    fontSize: "3rem", 
    fontWeight: 600,
  }
}));

// Main Image Upload Component
export const ImageUpload = () => {
  const classes = useStyles(); 
  const [selectedFile, setSelectedFile] = useState(); // image uploaded by user
  const [preview, setPreview] = useState(); // preview image URL
  const [data, setData] = useState(); // classification results
  const [image, setImage] = useState(false); // whether an image is uploaded
  const [isLoading, setIsloading] = useState(false); // loading spinner state
  let confidence = 0;

  // Send a file (image) to the backend API for classification
  const sendFile = async () => {
    if (image) {
      let formData = new FormData();
      formData.append("file", selectedFile);
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_API_URL,
        data: formData,
      });
      if (res.status === 200) {
        setData(res.data);
      }
      setIsloading(false);
    }
  }

  // Clear the currently uploaded image and results
  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  // Create image preview whenever uploaded file changes
  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  }, [selectedFile]);

  // If preview exists, send file to backend API, and display loading status
  useEffect(() => {
    if (!preview) {
      return;
    }
    setIsloading(true);
    sendFile();
  }, [preview]);


  // Handle file uploads from drop zone
  const onSelectFile = (files) => {
    // handle missing/invalid files
    if (!files || files.length === 0) {
      setSelectedFile(undefined);
      setImage(false);
      setData(undefined);
      return;
    }
    setSelectedFile(files[0]);
    setData(undefined);
    setImage(true);
  };

  // Calculate confidence percentage
  if (data) {
    confidence = (parseFloat(data.confidence) * 100).toFixed(2);
  }

  // Render the User Interface
  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            Fruit Tree Disease Classifier
          </Typography>
          <div className={classes.grow} />
    
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} className={classes.mainContainer} disableGutters={true}>
        <Grid
          className={classes.gridContainer}
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={12}>
            <Card className={`${classes.imageCard} ${!image ? classes.imageCardEmpty : ''}`}>
              {image && <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image={preview}
                  component="image"
                  title="image"
                />
              </CardActionArea>
              }
              {!image && <CardContent className={classes.content}>

                <Typography variant="h6" style={{ color: "black", fontSize:"18px", fontWeight:"600"}}>
                  Please upload a .JPG file of a plant leaf. The model will output the most likely crop, disease combination from among the following: <br />
                </Typography>

                <Typography variant="h6" align="center" style={{ color: "black", fontSize:"14px", fontWeight:"600"}}>
                  1. Apple, Apple Scab<br />
                  2. Apple, Black Rot<br />
                  3. Apple, Cedar Rust<br />
                  4. Apple, Healthy<br />
                  5. Cherry, Healthy<br />
                  6. Cherry, Powdery Mildew<br />
                  7. Grape, Black Rot<br />
                  8. Grape, Esca (Black Measles)<br />
                  9. Grape, Healthy<br />
                  10. Grape, Leaf Blight (Isariopsis Leaf Spot)<br />
                  11. Peach, Bacterial Spot<br />
                  12. Peach, Healthy<br />
                </Typography>

                <DropzoneArea
                  acceptedFiles={['image/*']}
                  dropzoneText={"Drag and drop an image of a plant leaf to process"}
                  onChange={onSelectFile}
                />
              </CardContent>}
              {data && <CardContent className={classes.detail}>
                <TableContainer component={Paper} className={classes.tableContainer}>
                  <Table className={classes.table} size="small" aria-label="simple table">
                    <TableHead className={classes.tableHead}>
                      <TableRow className={classes.tableRow}>
                        <TableCell className={classes.tableCell1}>Crop:</TableCell>
                        <TableCell className={classes.tableCell1}>Disease:</TableCell>
                        <TableCell align="right" className={classes.tableCell1}>Confidence:</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className={classes.tableBody}>
                      <TableRow className={classes.tableRow}>

                        <TableCell component="th" scope="row" className={classes.tableCell}>
                          {data.crop_name}
                        </TableCell>
                        <TableCell component="th" scope="row" className={classes.tableCell}>
                          {data.disease_name}
                        </TableCell>

                        <TableCell align="right" className={classes.tableCell}>{confidence}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>}
              {isLoading && <CardContent className={classes.detail}>
                <CircularProgress color="secondary" className={classes.loader} />
                <Typography className={classes.title} variant="h6" noWrap>
                  Processing
                </Typography>
              </CardContent>}
            </Card>
          </Grid>
          {data &&
            <Grid item className={classes.buttonGrid} >

              <ColorButton variant="contained" className={classes.clearButton} color="primary" component="span" size="large" onClick={clearData} startIcon={<Clear fontSize="large" />}>
                Clear
              </ColorButton>
            </Grid>}
        </Grid >
      </Container >
    </React.Fragment >
  );
};