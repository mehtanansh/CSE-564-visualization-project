from flask import Flask
from flask import render_template
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn import decomposition


def pca_biplot():
    df = pd.DataFrame(pd.read_csv("listings.csv"))
    selected_cols = ["price","minimum_nights","number_of_reviews","reviews_per_month","calculated_host_listings_count","availability_365"]
    df_numeric = df[selected_cols]
    std_scaler = StandardScaler()
    df_scaled = pd.DataFrame(std_scaler.fit_transform(df_numeric.to_numpy()),columns = selected_cols)
    df_scaled = df_scaled.fillna(0)
    pca = decomposition.PCA(n_components = 2)
    pca = pca.fit(df_scaled)
    df_pca_transformed = pca.transform(df_scaled)
    df_pca_transformed = pd.DataFrame(df_pca_transformed, columns = ("PC1","PC2"))
    df_pca_transformed = df_pca_transformed.to_dict('split')["data"]
    loadings = pca.components_.T
    loading_matrix = pd.DataFrame(loadings, columns=["PC1","PC2"], index = selected_cols).to_dict('split')["data"]
    return df_pca_transformed, loading_matrix

app = Flask(__name__)

@app.route("/",methods=['GET','POST'])
def index():
    pca_transformed_df, loadings = pca_biplot()
    return render_template("layout.html", title='Viz Project - Home', data = {"pca_data" : pca_transformed_df, "loadings" : loadings})


if __name__ == "__main__":
    app.run(debug = True)