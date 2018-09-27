package auth

import (
	"encoding/json"
	"fmt"
	"github.com/graph-gophers/graphql-go/errors"
	"log"
	"net/http"
	"zerosum/models"
	"zerosum/repository"
)

type fbProfile struct {
	Name string                 `json:"name"`
	Id   string                 `json:"id"`
	Err  map[string]interface{} `json:"error"`
}
type fbVerificationResponse struct {
	Data map[string]interface{} `json:"data"`
	Err  map[string]interface{} `json:"error"`
}

type fbLoginRequest struct {
	AccessToken string `json:"accessToken"`
	UserID      string `json:"userID"`
}

func FbLoginHandler(w http.ResponseWriter, r *http.Request) {
	var loginRequest fbLoginRequest
	json.NewDecoder(r.Body).Decode(&loginRequest)
	if err := verifyFbToken(loginRequest); err != nil {
		log.Print(err)
		http.Error(w, err.Error(), 500)
		return
	}
	profile, err := getFbProfile(loginRequest.AccessToken)
	if err != nil {
		log.Print(err)
		http.Error(w, err.Error(), 500)
		return
	}

	user, err := repository.GetOrCreateUser(models.User{FbId: profile.Id})

	signedToken, err := generateSignedUserToken(user)
	if err != nil {
		log.Print(err)
		http.Error(w, err.Error(), 500)
		return
	}
	w.Write([]byte(signedToken))
}

func getFbProfile(token string) (profile fbProfile, err error) {
	res, err := settings.httpClient.Get(fmt.Sprintf("https://graph.facebook.com/me?access_token=%s", token))
	if err != nil {
		return
	}
	json.NewDecoder(res.Body).Decode(&profile)
	//fmt.Println(profile)
	if profile.Err != nil {
		err = errors.Errorf(profile.Err["message"].(string))
	}
	return
}
func verifyFbToken(loginRequest fbLoginRequest) (err error) {
	// Fb token verification API
	res, err := settings.httpClient.Get(fmt.Sprintf("https://graph.facebook.com/debug_token?input_token=%s&access_token=%s",
		loginRequest.AccessToken, settings.fbAccessToken))
	if err != nil {
		return
	}
	var body fbVerificationResponse
	json.NewDecoder(res.Body).Decode(&body)
	//fmt.Printf("%+v\n", body)
	if body.Err != nil {
		err = errors.Errorf(body.Err["message"].(string))
		return
	}
	if !body.Data["is_valid"].(bool) {
		err = errors.Errorf("Invalid token")
		return
	}
	if body.Data["app_id"].(string) != settings.fbAppId {
		err = errors.Errorf("App ID mismatch")
		return
	}
	if body.Data["user_id"].(string) != loginRequest.UserID {
		err = errors.Errorf("User ID mismatch")
	}
	return
}
